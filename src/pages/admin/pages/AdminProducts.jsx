import React, { useEffect, useState } from "react";
import { useRestaurant } from "../../../contexts/RestaurantContext.jsx";
import firestoreService from "../../../servicies/firestoreService.js";
import supabaseService from "../../../servicies/supabaseService.js";
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
import ToggleSwitch from "../../../components/ToogleSwitch.jsx"
import ImageUploader from "../../../components/ImageUploader";
import { PenIcon } from "lucide-react";
import ListManager from "../../../components/ListManager.jsx"
import audioService from "../../../servicies/audio.js";

function SortableItem({ product, onUpdate, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: product.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ ...product });
    const [variations, setVariations] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    const { restaurant } = useRestaurant();


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked
                : name === "price" ? value // deja como string
                    : value
        }));
    };

    const handleSave = async () => {
        const currentSupabaseUser = await supabaseService.getCurrentUser();

        let imageUrl = form.image || "";

        if (currentSupabaseUser != null) {
            if (selectedImage) {
                const processedImage = await processImage(selectedImage, 416, 0.8);
                const uploadedUrl = await supabaseService.uploadProductImage(
                    processedImage,
                    restaurant.id,
                    product.id,
                    31536000
                );
                if (uploadedUrl != null) {
                    imageUrl = uploadedUrl;
                } else {
                    toast.error("No se pudo subir la imagen.");
                    return;
                }
            }
        } else {
            toast.error("Imagen no subida. Inicia sesión en storage para subir imágenes.");
        }

        // en la cadena de texto del input elimina los puntos (para convertir el numero completo) las , las convierte en . para usarlas como decimales.
        const rawPrice = form.price ?? "0";
        const cleaned = String(rawPrice).replace(/\./g, "").replace(",", ".");
        const parsedPrice = isNaN(Number(cleaned)) ? 0 : Number(cleaned);

        if (isNaN(parsedPrice)) return toast.error("Precio inválido");

        await onUpdate(product.id, { ...form, variations: variations, price: parsedPrice, image: (imageUrl || "") });
        setEdit(false);
    };

    const processImage = (file, maxSize = 416, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = () => {
                img.src = reader.result;
            };

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ratio = img.width / img.height;

                let newWidth = img.width;
                let newHeight = img.height;

                if (img.width > img.height && img.width > maxSize) {
                    newWidth = maxSize;
                    newHeight = Math.round(maxSize / ratio);
                } else if (img.height > maxSize) {
                    newHeight = maxSize;
                    newWidth = Math.round(maxSize * ratio);
                }

                canvas.width = newWidth;
                canvas.height = newHeight;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const webpFile = new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
                                type: "image/webp",
                                lastModified: Date.now(),
                            });
                            resolve(webpFile);
                        } else {
                            reject(new Error("No se pudo convertir la imagen"));
                        }
                    },
                    "image/webp",
                    quality
                );
            };

            img.onerror = reject;
            reader.onerror = reject;

            reader.readAsDataURL(file);
        });
    };

    useEffect(() => {
        if (edit) {
            setForm({ ...product });
        }
    }, [edit, product]);

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
            className="bg-[#151515] p-4 rounded shadow cursor-move border-2 border-[#202020] space-y-2 relative hover:shadow-gray-300/5 hover:shadow-sm"
        >
            {edit ? (
                <>
                    {form.image && !selectedImage && (
                        <img src={form.image} alt="Producto" className="rounded-lg mb-2 w-full h-auto" />
                    )}

                    <div className="p-6" onPointerDownCapture={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Subir una imagen</h3>
                        <ImageUploader onImageSelect={(file) => setSelectedImage(file)} />
                    </div>

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
                        min={0}
                        value={form.price}
                        onChange={handleChange}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        className="w-full p-1 rounded bg-gray-600 text-white"
                        placeholder="Precio"
                    />

                    <ListManager
                        className="mt-2"
                        title="Variaciones"
                        placeholder="Nombre de la variación"
                        items={variations}
                        setItems={setVariations}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                    />

                    <div className="flex justify-between mt-2">
                        <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={(e) => { stopDrag(e); if (window.confirm("Eliminar?")) onDelete(product.id); }} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded cursor-pointer">Eliminar</button>
                        <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={(e) => { stopDrag(e); handleSave(); audioService.play("manualInteract"); }} className="bg-green-700 hover:bg-green-800 px-2 py-1 rounded cursor-pointer">Guardar</button>
                        <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={(e) => { stopDrag(e); setEdit(false); }} className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded cursor-pointer">Cerrar</button>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex gap-4 items-start">
                        {/* Imagen del producto */}
                        <img
                            src={product.image || "https://placehold.co/400?text=Default+Image&font=roboto"}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded"
                        />

                        {/* Contenido del producto + botón de editar */}
                        <div className="flex justify-between items-start w-full">
                            <div className="max-w-80">
                                <h3 className="font-bold">{product.name}</h3>
                                <p className="text-xs overflow-y-auto max-h-12 pr-1">
                                    {product.desc || ""}
                                </p>
                                <p className="text-sm font-bold text-white mt-2">
                                    Precio: ${product.price.toLocaleString("es-CL")}
                                </p>
                            </div>

                            <button
                                onPointerDownCapture={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    stopDrag(e);
                                    setEdit(true);
                                }}
                                className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                                title="Editar producto"
                            >
                                <PenIcon className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* ToggleSwitch fijo abajo a la derecha */}
                        <div className="absolute bottom-4 right-4">
                            <ToggleSwitch
                                checked={product.state}
                                onChange={(e) =>
                                    onUpdate(product.id, { ...product, state: e.target.checked })
                                }
                                label="Activo:"
                            />
                        </div>
                    </div>
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
    const sensors = useSensors(useSensor(PointerSensor)/*, useSensor(KeyboardSensor)*/);
    const vibrate = (pattern = [100]) => navigator.vibrate?.(pattern);

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
            vibrate([40]);
            return;
        }

        const newId = `${newCat}${String(grouped[newCat]?.length + 1 || 1).padStart(3, "0")}`;
        const prodData = { ...itemA }; delete prodData.id;
        await firestoreService.insertWithId(`restaurants/${restaurant.id}/productos`, newId, prodData);
        await firestoreService.remove(`restaurants/${restaurant.id}/productos`, itemA.id);
        toast.success("Movido categoría");
        vibrate([50, 30, 50]);
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
        vibrate([100, 50, 100]);
    };

    const handleUpdateProduct = async (id, data) => {
        await firestoreService.insertWithId(`restaurants/${restaurant.id}/productos`, id, data);
        toast.success("Actualizado " + data.name);
        vibrate([100]);
    };

    const handleDeleteProduct = async (id) => {
        await firestoreService.remove(`restaurants/${restaurant.id}/productos`, id);
        toast.success("Eliminado");
        vibrate([200, 50, 200]);
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
                                    <button
                                        onClick={() => setCreatingCat(creatingCat === cat ? null : cat)}
                                        className={`text-green-400 text-xl cursor-pointer transition-transform duration-300 transform origin-center ${creatingCat === cat ? "rotate-45" : "rotate-0"}`}
                                        title={creatingCat === cat ? "Cancelar" : "Crear producto"}>
                                        +
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] pr-2">
                                    {grouped[cat].map((p, index) => (
                                        <SortableItem key={`${p.id}-${index}`} product={p} onUpdate={handleUpdateProduct} onDelete={handleDeleteProduct} />
                                    ))}
                                </div>

                                {creatingCat === cat && (
                                    <div className="mt-4">
                                        <input className="w-full p-2 rounded bg-gray-700 mb-2 text-white" placeholder="Nombre del producto" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
                                        <button onClick={() => { handleCreateProduct(cat); audioService.play("manualInteract") }} className="bg-blue-600 px-4 py-1 rounded text-white">Crear</button>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    ))}
                    <div className="bg-[#111] rounded p-4 flex flex-col">
                        <button onClick={handleAddCategory} className="bg-green-700 hover:bg-green-800 cursor-pointer text-white px-4 py-2 rounded mb-6">+ Categoría</button>
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
