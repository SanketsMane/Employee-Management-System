// Firebase Firestore Service
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { db } from "./config";

// Generic CRUD operations
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw error;
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    throw error;
  }
};

export const getDocuments = async (collectionName, conditions = []) => {
  try {
    let q = collection(db, collectionName);
    
    if (conditions.length > 0) {
      q = query(q, ...conditions);
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    throw error;
  }
};

// Real-time listeners
export const subscribeToCollection = (collectionName, callback, conditions = []) => {
  let q = collection(db, collectionName);
  
  if (conditions.length > 0) {
    q = query(q, ...conditions);
  }
  
  return onSnapshot(q, (snapshot) => {
    const documents = [];
    snapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    callback(documents);
  });
};

export const subscribeToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

// Batch operations
export const batchWrite = async (operations) => {
  try {
    const batch = writeBatch(db);
    
    operations.forEach(({ type, collection: collectionName, docId, data }) => {
      const docRef = docId ? doc(db, collectionName, docId) : doc(collection(db, collectionName));
      
      switch (type) {
        case 'set':
          batch.set(docRef, { ...data, createdAt: serverTimestamp() });
          break;
        case 'update':
          batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    });
    
    await batch.commit();
  } catch (error) {
    throw error;
  }
};

// Helper functions for specific collections
export const getEmployees = async () => {
  return await getDocuments("users", [where("role", "==", "employee")]);
};

export const getAdmins = async () => {
  return await getDocuments("users", [where("role", "==", "admin")]);
};

export const getTasks = async (userId = null) => {
  const conditions = userId ? [where("assignedTo", "==", userId)] : [];
  return await getDocuments("tasks", conditions);
};

export const getAttendance = async (userId = null, date = null) => {
  let conditions = [];
  if (userId) conditions.push(where("userId", "==", userId));
  if (date) conditions.push(where("date", "==", date));
  
  return await getDocuments("attendance", conditions);
};

export const getMessages = async (limit = 50) => {
  return await getDocuments("messages", [orderBy("createdAt", "desc"), limit(limit)]);
};

export const getLearningResources = async (category = null) => {
  const conditions = category ? [where("category", "==", category)] : [];
  return await getDocuments("learningResources", conditions);
};

export const getBatches = async () => {
  return await getDocuments("batches");
};
