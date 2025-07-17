import { collection, addDoc, doc, getDoc, getDocs, updateDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Reference to 'notes' collection
const notesCollection = collection(db, "notes");

export const createNote = async (userId) => {
  const newNote = {
    title: "Untitled Note",
    content: "",
    ownerId: userId,
    collaborators: [],
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(notesCollection, newNote);
  return docRef.id;
};

export const getUserNotes = async (userId) => {
  const q = query(notesCollection, where("ownerId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getNoteById = async (noteId) => {
  const docRef = doc(db, "notes", noteId);
  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...snapshot.data() };
};

export const updateNote = async (noteId, updatedFields) => {
  const docRef = doc(db, "notes", noteId);
  await updateDoc(docRef, {
    ...updatedFields,
    updatedAt: serverTimestamp()
  });
};

export const listenToNote = (noteId, callback) => {
  const docRef = doc(db, "notes", noteId);
  return onSnapshot(docRef, (snapshot) => {
    callback({ id: snapshot.id, ...snapshot.data() });
  });
};
