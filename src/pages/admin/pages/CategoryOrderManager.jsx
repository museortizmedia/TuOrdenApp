import React, { useEffect, useMemo, useState } from "react";
import { useRestaurant } from "../../../contexts/RestaurantContext";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import firestoreService from "../../../servicies/firestoreService";
import toast from "react-hot-toast";

function SortableCategoryCard({ category, children }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        background: "#111",
        borderRadius: "0.5rem",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        cursor: "grab"
    };

    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
            {children}
        </div>
    );
}

function CategoryOrderManager() {
    const { restaurant } = useRestaurant();
    const [products, setProducts] = useState([]);
    const [activeCat, setActiveCat] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        if (!restaurant?.id) return;
        const unsub = firestoreService.listenAll(
            `restaurants/${restaurant.id}/productos`,
            setProducts
        );
        return unsub;
    }, [restaurant]);

    // Agrupamiento y ordenamiento
    const [categoryMap, groupedProducts] = useMemo(() => {
        const groups = {};
        const map = {};

        products.forEach((prod) => {
            const category = prod.id.slice(0, -3);

            if (!groups[category]) groups[category] = [];
            groups[category].push(prod);

            if (prod.categoryOrder !== undefined) {
                if (map[category] === undefined || prod.categoryOrder < map[category]) {
                    map[category] = prod.categoryOrder;
                }
            }
        });

        Object.keys(groups).forEach((cat) => {
            groups[cat].sort((a, b) => Number(a.id.slice(-3)) - Number(b.id.slice(-3)));
        });

        return [map, groups];
    }, [products]);

    const categories = useMemo(() => {
        const keys = Object.keys(groupedProducts);
        return keys.sort((a, b) => (categoryMap[a] ?? 999) - (categoryMap[b] ?? 999));
    }, [groupedProducts, categoryMap]);

    const handleDragEnd = async ({ active, over }) => {
        setActiveCat(null);
        if (!over || active.id === over.id) return;

        const newCats = arrayMove(categories, categories.indexOf(active.id), categories.indexOf(over.id));

        for (let i = 0; i < newCats.length; i++) {
            const cat = newCats[i];
            const firstProduct = groupedProducts[cat]?.[0];
            if (firstProduct) {
                await firestoreService.insertWithId(
                    `restaurants/${restaurant.id}/productos`,
                    firstProduct.id,
                    { ...firstProduct, categoryOrder: i + 1 }
                );
            }
        }

        toast.success("Orden de categorías actualizado");
    };

    return (
        <div className="p-4 text-white">
            <h2 className="text-2xl font-bold mb-4">Ordenar Categorías</h2>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={({ active }) => setActiveCat(active.id)}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                    <div className="grid gap-4">
                        {categories.map((cat) => (
                            <SortableCategoryCard key={cat} category={cat}>
                                <h3 className="font-bold text-lg mb-2">{cat}</h3>
                                <p className="text-sm text-gray-400">
                                    {groupedProducts[cat]?.length || 0} productos
                                </p>
                            </SortableCategoryCard>
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay>
                    {activeCat && (
                        <div className="bg-[#222] p-4 rounded">
                            <strong>{activeCat}</strong>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

export default CategoryOrderManager;