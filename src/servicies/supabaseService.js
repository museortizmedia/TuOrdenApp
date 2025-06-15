import { supabase } from '../supabase/supabaseClient.js'

const BUCKET_NAME = 'productos';
const MAX_SIZE_BYTES = 1_000_000; // 1MB

const supabaseService = {

    // normal functions
    getPublicUrlOf(data) {
        const projectUrl = supabase.supabaseUrl; // viene desde tu cliente
        const publicUrl = `${projectUrl}/storage/v1/object/public/${BUCKET_NAME}/${data.path}`;
        return publicUrl;
    },

    // async functions
    async uploadProductImage(file, restaurantId, productId, cacheDuration = 3600) {
        if (!file || file.size > MAX_SIZE_BYTES) {
            console.warn('Archivo no válido')
            return null
        }

        const ext = file.name.split('.').pop()
        const fileName = `${productId}-${Date.now()}.${ext}`
        const filePath = `${restaurantId}/${fileName}`

        const { data, error } = await supabase
            .storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: `${cacheDuration}`,
                upsert: false,
            })

        if (error) {
            console.error('Error al subir imagen:', error.message)
            return null
        }

        console.log('✅ Subida exitosa, resultado:', data);

        return this.getPublicUrlOf(data);
    },
    /*
    const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    const url = await supabaseService.uploadProductImage(
      file,
      restaurant.id,
      'prod456'
    );

        console.log('URL pública:', url);

    }
        <input type="file" accept="image/*" onChange={handleFileUpload} />
    */

    // Iniciar sesión con email y contraseña
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Login error:', error.message)
            return null
        }

        return data.user
    },

    // Cerrar sesión
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            //console.error('Error al cerrar sesión:', error.message);
        } else {
            //console.log('✅ Sesión cerrada correctamente');
        }
    },

    // Obtener sesión actual
    async getCurrentUser() {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        return user
    },

}

export default supabaseService;