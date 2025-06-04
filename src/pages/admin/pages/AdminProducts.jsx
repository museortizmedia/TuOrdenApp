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
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { doc } from "firebase/firestore";
import { db } from "../../../firebase/firebase.js";
import ToggleSwitch from "../../../components/ToogleSwitch.jsx"

function SortableItem({ product, onUpdate, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: product.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ ...product });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : name === "price" ? Number(value) : value
        }));
    };

    const handleSave = async () => {
        if (isNaN(form.price)) return toast.error("Precio inválido");
        await onUpdate(product.id, form);
        setEdit(false);
    };

    const stopDrag = (e) => {
        e.stopPropagation();
        e.preventDefault();
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style}
            className="bg-[#151515] p-4 rounded shadow cursor-move border-2 border-[#202020] space-y-2 relative"
        >
            {edit ? (
                <>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        className="mt-1 w-full p-1 rounded bg-gray-600 text-white"
                        placeholder="Nombre"
                    />
                    <textarea
                        name="desc"
                        value={form.desc}
                        onChange={handleChange}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        className="w-full p-1 rounded bg-gray-600 text-white"
                        placeholder="Descripción"
                    />
                    <input
                        name="price"
                        type="number"
                        step={100}
                        value={form.price}
                        onChange={handleChange}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        className="w-full p-1 rounded bg-gray-600 text-white"
                        placeholder="Precio"
                    />

                    <div className="flex justify-between mt-2">
                        <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={(e) => { stopDrag(e); if (window.confirm("Eliminar?")) onDelete(product.id); }} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded">Eliminar</button>
                        <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={(e) => { stopDrag(e); handleSave(); }} className="bg-green-700 hover:bg-green-800 px-2 py-1 rounded">Guardar</button>
                        <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={(e) => { stopDrag(e); setEdit(false); }} className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded">Volver</button>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold">{product.name}</h3>
                            <p className="text-xs">{product.desc || ""}</p>
                            <p className="text-sm mt-2">Precio: ${(product.price).toLocaleString('es-CL')}</p>
                        </div>
                        <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={(e) => { stopDrag(e); setEdit(true); }} className="text-xs underline mt-5 text-blue-400">Editar</button>
                    </div>
                    <ToggleSwitch
                        checked={product.state}
                        onChange={e => onUpdate(product.id, { ...product, state: e.target.checked })}
                        label="Activo:"
                    />
                </>
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
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

    useEffect(() => {
        if (!restaurant?.id) return;
        const unsub = firestoreService.listenAll(`restaurants/${restaurant.id}/productos`, setProducts);
        return unsub;
    }, [restaurant]);

    useEffect(() => {
        const cats = Array.from(new Set(products.map(p => p.id.slice(0, -3))));
        setCategories(cats);
    }, [products]);

    const grouped = categories.reduce((acc, cat) => {
        acc[cat] = products.filter(p => p.id.startsWith(cat)).sort((a, b) => a.id.localeCompare(b.id));
        return acc;
    }, {});

    const handleDragEnd = async ({ active, over }) => {
        setActiveProduct(null);
        if (!over || active.id === over.id) return;

        const itemA = products.find(p => p.id === active.id);
        const itemB = products.find(p => p.id === over.id);
        const oldCat = itemA.id.slice(0, -3);
        const newCat = categories.includes(over.id) ? over.id : itemB.id.slice(0, -3);

        if (oldCat === newCat) {
            const ids = grouped[oldCat].map(p => p.id);
            const newOrder = arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id));
            for (let i = 0; i < newOrder.length; i++) {
                const id = newOrder[i];
                const prod = products.find(p => p.id === id);
                const newId = `${oldCat}${String(i + 1).padStart(3, "0")}`;
                if (prod.id !== newId) await firestoreService.insertWithId(`restaurants/${restaurant.id}/productos`, newId, prod);
            }
            toast.success("Reordenado");
            return;
        }

        const newId = `${newCat}${String(grouped[newCat]?.length + 1 || 1).padStart(3, "0")}`;
        const prodData = { ...itemA }; delete prodData.id;
        await firestoreService.insertWithId(`restaurants/${restaurant.id}/productos`, newId, prodData);
        await firestoreService.remove(`restaurants/${restaurant.id}/productos`, itemA.id);
        toast.success("Movido categoría");
    };

    const handleAddCategory = () => {
        const cat = prompt("Nuevo nombre de categoría:");
        if (cat && !categories.includes(cat)) setCategories([...categories, cat]);
    };

    const handleCreateProduct = async (cat) => {
        if (!newProductName.trim()) return toast.error("Nombre requerido");
        const id = `${cat}${String(grouped[cat]?.length + 1 || 1).padStart(3, "00")}`;
        await firestoreService.insertWithId(`restaurants/${restaurant.id}/productos`, id, { name: newProductName, desc: "", price: 0, image: "", state: true });
        setNewProductName("");
        setCreatingCat(null);
        toast.success("Creado");
    };

    const handleUpdateProduct = async (id, data) => {
        await firestoreService.insertWithId(`restaurants/${restaurant.id}/productos`, id, data);
        toast.success("Actualizado "+data.name);
    };

    const handleDeleteProduct = async (id) => {
        await firestoreService.remove(`restaurants/${restaurant.id}/productos`, id);
        toast.success("Eliminado");
    };

    return (
        <div className="p-4 text-white">
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    style: {
                        marginTop: '60px'
                    }
                }}
            />
            <h1 className="text-2xl font-bold mb-4">Administrador de Productos</h1>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveProduct(products.find(p => p.id === active.id))} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(cat => (
                        <SortableContext key={cat} items={grouped[cat].map(p => p.id)} strategy={verticalListSortingStrategy}>
                            <div className="bg-[#111] rounded p-4 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="font-bold text-lg">{cat}</h2>
                                    <button onClick={() => setCreatingCat(creatingCat === cat ? null : cat)}
                                        className={`text-green-400 text-xl cursor-pointer transition-transform duration-300 transform origin-center ${creatingCat === cat ? "rotate-45" : "rotate-0"}`} title="Crear producto">+</button>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] pr-2">
                                    {grouped[cat].map((p, index) => (
                                        <SortableItem key={`${p.id}-${index}`} product={p} onUpdate={handleUpdateProduct} onDelete={handleDeleteProduct} />
                                    ))}
                                </div>

                                {creatingCat === cat && (
                                    <div className="mt-4">
                                        <input className="w-full p-2 rounded bg-gray-700 mb-2 text-white" placeholder="Nombre del producto" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
                                        <button onClick={() => handleCreateProduct(cat)} className="bg-blue-600 px-4 py-1 rounded text-white">Crear</button>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    ))}
                    <div className="bg-[#111] rounded p-4 flex flex-col">
                        <button onClick={handleAddCategory} className="bg-green-700 text-white px-4 py-2 rounded mb-6">+ Categoría</button>
                    </div>
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
