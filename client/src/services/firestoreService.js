import { collection, addDoc, doc, getDoc, getDocs, updateDoc, query, where, onSnapshot, serverTimestamp,arrayUnion, getDocsFromServer} from "firebase/firestore";
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

export const getSharedNotes = async (userId) => {
  const q = query(notesCollection, where("collaborators", "array-contains", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const shareNoteWithEmail = async (noteId, email) => {
  const usersCollection = collection(db, "users"); // assuming user data is stored
  const q = query(usersCollection, where("email", "==", email));
  const snap = await getDocsFromServer(q);

  if (snap.empty) {
    throw new Error("User not found");
  }

  const collaboratorUid = snap.docs[0].id;
  const noteRef = doc(db, "notes", noteId);
  await updateDoc(noteRef, {
    collaborators: arrayUnion(collaboratorUid),
  });
};

export const getUserById = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
};

export const addCollaboratorByEmail = async (noteId, email) => {
  try {
    // Find the user by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return false;

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // Add userId to collaborators array in note
    const noteRef = doc(db, "notes", noteId);
    await updateDoc(noteRef, {
      collaborators: arrayUnion(userId),
    });

    return true;
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return false;
  }
};



