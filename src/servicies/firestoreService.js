// services/firestoreService.js
import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  onSnapshot 
} from "firebase/firestore";

/**
 * Servicio de acceso a Firestore.
 * Pensado para ser usado como capa de abstracción de base de datos, al estilo de un ORM.
 * Inspirado en convenciones de bases de datos relacionales para facilitar su adopción.
 */
const firestoreService = {
  /**
   * Buscar un documento por ID en una colección
   * @param {string} collectionName - Nombre de la colección
   * @param {string} id - ID del documento
   * @returns {Object|null} Documento encontrado o null si no existe
   */
  async findById(collectionName, id) {
    try {
      const ref = doc(db, collectionName, id);
      const snapshot = await getDoc(ref);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    } catch (error) {
      console.error(`Error en findById(${collectionName}, ${id}):`, error);
      throw error;
    }
  },

  /**
   * Obtener todos los documentos(elementos) de una colección
   * @param {string} collectionName
   * @returns {Array} Lista de documentos con ID
   */
  async findAll(collectionName) {
    try {
      const ref = collection(db, collectionName);
      const snapshot = await getDocs(ref);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error en findAll(${collectionName}):`, error);
      throw error;
    }
  },

  /**
   * Consultar documentos que cumplen ciertas condiciones
   * @param {string} collectionName
   * @param {Object} filters - Objeto de pares campo:valor
   * @returns {Array} Documentos que cumplen los filtros
   */
  async findWhere(collectionName, filters) {
    try {
      const ref = collection(db, collectionName);
      const conditions = Object.entries(filters).map(([key, value]) =>
        where(key, "==", value)
      );
      const q = query(ref, ...conditions);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error en findWhere(${collectionName}):`, error);
      throw error;
    }
  },

  /**
   * Obtener todos los documentos de una subcolección
   * @param {string} parentCollection
   * @param {string} parentId
   * @param {string} subcollectionName
   * @returns {Array} Documentos de la subcolección
   */
  async findSubcollection(parentCollection, parentId, subcollectionName) {
    try {
      const subRef = collection(db, parentCollection, parentId, subcollectionName);
      const snapshot = await getDocs(subRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error en findSubcollection(${parentCollection}/${parentId}/${subcollectionName}):`, error);
      throw error;
    }
  },

  /**
   * Insertar un nuevo documento con ID automático
   * @param {string} collectionName
   * @param {Object} data - Datos del documento
   * @returns {string} ID generado del documento
   */
  async insert(collectionName, data) {
    try {
      const ref = collection(db, collectionName);
      const docRef = await addDoc(ref, data);
      return docRef.id;
    } catch (error) {
      console.error(`Error en insert(${collectionName}):`, error);
      throw error;
    }
  },

  /**
   * Insertar o sobrescribir un documento con ID definido
   * @param {string} collectionName
   * @param {string} id
   * @param {Object} data
   * @returns {string} ID del documento insertado/sobrescrito
   */
  async insertWithId(collectionName, id, data) {
    try {
      const ref = doc(db, collectionName, id);
      await setDoc(ref, data);
      return id;
    } catch (error) {
      console.error(`Error en insertWithId(${collectionName}, ${id}):`, error);
      throw error;
    }
  },

  /**
   * Actualizar campos de un documento existente
   * @param {string} collectionName
   * @param {string} id
   * @param {Object} data - Campos a actualizar
   * @returns {string} ID del documento actualizado
   */
  async update(collectionName, id, data) {
    try {
      const ref = doc(db, collectionName, id);
      await updateDoc(ref, data);
      return id;
    } catch (error) {
      console.error(`Error en update(${collectionName}, ${id}):`, error);
      throw error;
    }
  },

  /**
   * Eliminar un documento por ID
   * @param {string} collectionName
   * @param {string} id
   * @returns {string} ID del documento eliminado
   */
  async remove(collectionName, id) {
    try {
      const ref = doc(db, collectionName, id);
      await deleteDoc(ref);
      return id;
    } catch (error) {
      console.error(`Error en remove(${collectionName}, ${id}):`, error);
      throw error;
    }
  },

  /**
   * 
   * 
   *
   */
  async findSubdoc(parentCollection, parentId, subcollectionName, docId) {
  try {
    const ref = doc(db, parentCollection, parentId, subcollectionName, docId);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  } catch (error) {
    console.error(`Error en findSubdoc(${parentCollection}/${parentId}/${subcollectionName}/${docId}):`, error);
    throw error;
  }
},

  // Auxiliares

  /**
   * Resuelve de forma recursiva todas las referencias (DocumentReference) dentro de un objeto.
   * 
   * @param {Object} obj - El objeto que contiene campos con referencias (puede ser documento completo de Firestore).
   * @param {number} maxDepth - Profundidad máxima de resolución (por defecto: 2).
   * @param {number} currentDepth - Profundidad actual del recorrido (no modificar manualmente).
   * @returns {Object} Objeto con las referencias resueltas hasta la profundidad especificada.
   */
  async deepResolveReferences(obj, maxDepth = 2, currentDepth = 0) {
    if (
      currentDepth >= maxDepth ||
      typeof obj !== "object" ||
      obj === null
    ) {
      return obj;
    }

    const resolved = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      // ✅ Detectar correctamente DocumentReference
      if (value instanceof DocumentReference) {
        try {
          const snap = await getDoc(value);
          resolved[key] = snap.exists()
            ? await firestoreService.deepResolveReferences(
                { id: snap.id, ...snap.data() },
                maxDepth,
                currentDepth + 1
              )
            : null;
        } catch (err) {
          console.warn(`No se pudo resolver la referencia en "${key}":`, err);
          resolved[key] = null;
        }
      }

      else if (typeof value === "object" && value !== null) {
        resolved[key] = await firestoreService.deepResolveReferences(value, maxDepth, currentDepth + 1);
      }

      else {
        resolved[key] = value;
      }
    }

    return resolved;
  },

  // Real time

  /**
 * Escucha todos los documentos de una colección y ejecuta un callback en tiempo real.
 * @param {string} collectionName - Nombre de la colección
 * @param {function} callback - Función que recibe un array actualizado de documentos
 * @returns {function} Función para cancelar la suscripción
 */
listenAll(collectionName, callback) {
  try {
    const ref = collection(db, collectionName);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
    return unsubscribe;
  } catch (error) {
    console.error(`Error en listenAll(${collectionName}):`, error);
    throw error;
  }
},

/**
 * Escucha en tiempo real una subcolección.
 * @param {string} parentCollection
 * @param {string} parentId
 * @param {string} subcollectionName
 * @param {function} callback - Función que recibe un array actualizado de documentos
 * @returns {function} Función para cancelar la suscripción
 */
listenSubcollection(parentCollection, parentId, subcollectionName, callback) {
  try {
    const subRef = collection(db, parentCollection, parentId, subcollectionName);
    const unsubscribe = onSnapshot(subRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
    return unsubscribe;
  } catch (error) {
    console.error(`Error en listenSubcollection(${parentCollection}/${parentId}/${subcollectionName}):`, error);
    throw error;
  }
}

};

export default firestoreService;