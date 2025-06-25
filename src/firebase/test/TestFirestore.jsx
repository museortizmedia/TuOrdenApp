import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function TestFirestore() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "restaurants"));
        const list = [];
        querySnapshot.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setRestaurants(list);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) return <p className="p-4">⏳ Cargando restaurantes...</p>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">🍽️ Restaurantes encontrados:</h2>
      <ul className="space-y-2">
        {restaurants.map(r => (
          <li key={r.id} className="border p-2 rounded shadow">
            <strong>{r.name}</strong><br />
            <small>{r.location}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}