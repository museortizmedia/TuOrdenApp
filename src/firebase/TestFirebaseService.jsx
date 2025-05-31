import { useEffect } from "react";
import {
    getDocById,
    getAllDocs,
    queryDocs,
    getSubcollection
} from "../servicies/firestoreService";

export default function TestFirebaseService() {

    useEffect(() => {
        const fetchData = async () => {
            // Get one restaurant by ID
            const restaurant = await getDocById("restaurants", "4GtG9cHGEc82yscL4vie");

            // Get all restaurants
            const allRestaurants = await getAllDocs("restaurants");

            // Query by slug
            const result = await queryDocs("branches", { name: "Sede Ciudad Sur" });

            // Get menu of a restaurant
            const menu = await getSubcollection("restaurants", "4GtG9cHGEc82yscL4vie", "ownerId");

            console.log(restaurant);
            console.log(allRestaurants);
            console.log(result);
            console.log(menu);
        };
        fetchData();
    }, []);

    return (
        <div className="p-4">

        </div>
    );
}
