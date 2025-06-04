import React, { useEffect, useState } from "react";
import { useRestaurant } from "../../../contexts/RestaurantContext.jsx";
import firestoreService from "../../../servicies/firestoreService.js";
import toast, { Toaster } from "react-hot-toast";
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
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ product, onUpdate, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: product.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ ...product });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : name === "price"
                        ? Number(value)
                        : value,
        }));
    };

    const handleSave = async () => {
        if (isNaN(form.price)) {
            toast.error("El precio debe ser un número válido");
            return;
        }
        await onUpdate(product.id, form);
        setEdit(false);
    };

    const handleDelete = async () => {
        const confirm = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
        if (confirm) {
            await onDelete(product.id);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-gray-700 p-4 rounded space-y-2 relative"
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 right-2 p-1 z-10 text-gray-400 cursor-grab hover:text-white"
                title="Arrastrar"
            >
                ☰
            </div>

            {edit ? (
                <div className="space-y-2">
                    <input name="name" value={form.name} onChange={handleChange} className="w-full p-1 rounded bg-gray-600 text-white" placeholder="Nombre" />
                    <textarea name="desc" value={form.desc} onChange={handleChange} className="w-full p-1 rounded bg-gray-600 text-white" placeholder="Descripción" />
                    <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full p-1 rounded bg-gray-600 text-white" placeholder="Precio" />
                    <div className="flex items-center gap-2">
                        <label>Activo:</label>
                        <input type="checkbox" name="state" checked={form.state} onChange={handleChange} />
                    </div>
                    <div className="flex justify-between mt-2">
                        <button onClick={handleDelete} className="bg-red-600 px-2 py-1 rounded">Eliminar</button>
                        <button onClick={handleSave} className="bg-green-700 px-2 mx-2 py-1 rounded">Guardar</button>
                        <button onClick={() => setEdit(false)} className="bg-blue-600 px-2 py-1 rounded">Salir</button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold">{product.name}</h3>
                            <p className="text-sm">{product.desc}</p>
                            <p className="text-sm">Precio: ${product.price}</p>
                        </div>
                        <button onClick={() => setEdit(true)} className="text-xs underline mt-5 text-blue-400">Editar</button>
                    </div>
                    <div className="mt-2">
                        <label className="text-xs mr-2">Activo:</label>
                        <input type="checkbox" checked={product.state} onChange={(e) => onUpdate(product.id, { ...product, state: e.target.checked })} />
                    </div>
                </div>
            )}
        </div>
    );
}

function AdminProducts() {
    const { restaurant } = useRestaurant();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [creatingCat, setCreatingCat] = useState(null);
    const [newProductName, setNewProductName] = useState("");
    const [activeProduct, setActiveProduct] = useState(null);

    useEffect(() => {
        if (restaurant?.id) {
            firestoreService.findAll(`restaurants/${restaurant.id}/productos`).then((res) => {
                setProducts(res);
                const unique = Array.from(new Set(res.map((p) => p.id.slice(0, -3))));
                setCategories(unique);
            });
        }
    }, [restaurant]);

    const grouped = categories.reduce((acc, cat) => {
        acc[cat] = products.filter((p) => p.id.startsWith(cat)).sort((a, b) => a.id.localeCompare(b.id));
        return acc;
    }, {});

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

    const handleDragEnd = async ({ active, over }) => {
        setActiveProduct(null);
        if (!over || active.id === over.id) return;

        const activeItem = products.find((p) => p.id === active.id);
        const overItem = products.find((p) => p.id === over.id);
        const oldCat = activeItem.id.slice(0, -3);

        if (!overItem) return;

        const newCat = categories.includes(over.id) ? over.id : overItem.id.slice(0, -3);

        if (oldCat === newCat) {
            const items = grouped[oldCat].map((p) => p.id);
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
            const newOrder = arrayMove(items, oldIndex, newIndex);

            const updated = products.map((p) => {
                if (p.id.startsWith(oldCat)) {
                    const idx = newOrder.indexOf(p.id);
                    const newId = `${oldCat}${String(idx + 1).padStart(3, "0")}`;
                    return { ...p, id: newId };
                }
                return p;
            });

            for (const p of updated) {
                await firestoreService.insertWithId(`restaurants/${restaurant.id}/productos`, p.id, p);
            }

            setProducts(updated);
            toast.success("Reordenado");
            return;
        }

        const newId = `${newCat}${String(grouped[newCat]?.length + 1 || 1).padStart(3, "0")}`;
        const { id, ...data } = activeItem;

        await firestoreService.insertWithId(`restaurants/${restaurant.id}/productos`, newId, data);
        await firestoreService.remove(`restaurants/${restaurant.id}/productos`, id);

        const updated = await firestoreService.findAll(`restaurants/${restaurant.id}/productos`);
        setProducts(updated);
        toast.success("Producto movido de categoría");
    };

    const handleAddCategory = () => {
        const cat = prompt("Nombre de la nueva categoría:");
        if (cat && !categories.includes(cat)) {
            setCategories([...categories, cat]);
        }
    };

    const handleCreateProduct = async (category) => {
        if (!newProductName.trim()) return toast.error("Nombre requerido");
        const id = `${category}${String(grouped[category]?.length + 1 || 1).padStart(3, "0")}`;
        const product = { name: newProductName, desc: "", price: 0, image: "", state: true };

        await firestoreService.insertWithId(`restaurants/${restaurant.id}/productos`, id, product);
        const updated = await firestoreService.findAll(`restaurants/${restaurant.id}/productos`);
        setProducts(updated);
        setCreatingCat(null);
        setNewProductName("");
        toast.success("Producto creado");
    };

    const handleUpdateProduct = async (id, updatedData) => {
        await firestoreService.insertWithId(`restaurants/${restaurant.id}/productos`, id, updatedData);
        const updated = await firestoreService.findAll(`restaurants/${restaurant.id}/productos`);
        setProducts(updated);
        toast.success("Producto actualizado");
    };

    const handleDeleteProduct = async (id) => {
        await firestoreService.remove(`restaurants/${restaurant.id}/productos`, id);
        const updated = await firestoreService.findAll(`restaurants/${restaurant.id}/productos`);
        setProducts(updated);
        toast.success("Producto eliminado");
    };

    return (
        <div className="p-4 text-white">
            <Toaster />
            <h1 className="text-2xl font-bold mb-4">Administrador de Productos</h1>
            <button onClick={handleAddCategory} className="bg-green-700 text-white px-4 py-2 rounded mb-6">+ Nueva Categoría</button>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={({ active }) => setActiveProduct(products.find(p => p.id === active.id))}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <SortableContext key={cat} items={grouped[cat].map((p) => p.id)} strategy={verticalListSortingStrategy}>
                            <div className="bg-gray-800 rounded p-4 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="font-bold text-lg">{cat}</h2>
                                    <button onClick={() => setCreatingCat(cat)} className="text-green-400 text-xl">+</button>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] pr-2">
                                    {grouped[cat].map((p) => (
                                        <SortableItem
                                            key={p.id}
                                            product={p}
                                            onUpdate={handleUpdateProduct}
                                            onDelete={handleDeleteProduct}
                                        />
                                    ))}
                                </div>

                                {creatingCat === cat && (
                                    <div className="mt-4">
                                        <input className="w-full p-2 rounded bg-gray-700 mb-2" placeholder="Nombre del producto" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                                        <button onClick={() => handleCreateProduct(cat)} className="bg-blue-600 px-4 py-1 rounded text-white">Crear</button>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    ))}
                </div>

                <DragOverlay>
                    {activeProduct && (
                        <div className="bg-gray-600 p-4 rounded shadow-lg">
                            <h3>{activeProduct.name}</h3>
                            <p className="text-sm">{activeProduct.desc}</p>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

export default AdminProducts;