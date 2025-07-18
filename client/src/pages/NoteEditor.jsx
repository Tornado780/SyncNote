import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  listenToNote,
  updateNote,
  getUserById,
  addCollaboratorByEmail,
} from "../services/firestoreService";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [note, setNote] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareStatus, setShareStatus] = useState(null);
  const [presenceList, setPresenceList] = useState([]);

  // Real-time presence tracking
  useEffect(() => {
    if (!user) return;

    const presenceRef = doc(db, `notes/${id}/presence/${user.uid}`);
    setDoc(presenceRef, {
      email: user.email,
      lastSeen: serverTimestamp(),
    });

    const interval = setInterval(() => {
      setDoc(presenceRef, {
        email: user.email,
        lastSeen: serverTimestamp(),
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [id, user]);

  // Listen to collaborators' presence
  useEffect(() => {
    const presRef = collection(db, `notes/${id}/presence`);
    const unsub = onSnapshot(presRef, (snapshot) => {
      const now = Date.now();
      const active = snapshot.docs.map((doc) => {
        const data = doc.data();
        const isOnline = data.lastSeen?.toMillis() > now - 15000;
        return { ...data, uid: doc.id, isOnline };
      });
      setPresenceList(active);
    });
    return () => unsub();
  }, [id]);

  // Listen to note itself
  useEffect(() => {
    const unsub = listenToNote(id, async (noteData) => {
      setNote(noteData);
    });
    return () => unsub();
  }, [id]);

  const handleChange = (field, value) => {
    setNote((prev) => ({ ...prev, [field]: value }));
    updateNote(id, { [field]: value });
    showSavedToast();
  };

  const showSavedToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleShare = async () => {
    const success = await addCollaboratorByEmail(id, shareEmail);
    setShareStatus(success ? "✅ Shared successfully" : "❌ User not found");
    setShareEmail("");
    setTimeout(() => setShareStatus(null), 2500);
  };

  if (!note) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-blue-50 p-6 relative">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </button>
          <span className="text-xs text-gray-500 italic">
            Changes save automatically
          </span>
        </div>

        {/* Presence badges */}
        <div className="flex flex-wrap gap-2 items-center text-sm text-gray-700">
          {presenceList.map((c) => (
            <span
              key={c.uid}
              className={`px-2 py-1 rounded-md ${
                c.isOnline
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              👤 {c.email}
            </span>
          ))}
        </div>

        {/* Share form */}
        <div className="flex items-center gap-2">
          <input
            type="email"
            placeholder="Collaborator's email"
            className="border px-3 py-1 rounded focus:outline-none focus:ring focus:ring-blue-300"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
          <button
            onClick={handleShare}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Share
          </button>
          {shareStatus && (
            <span className="text-sm text-gray-600">{shareStatus}</span>
          )}
        </div>

        <input
          type="text"
          value={note.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full text-2xl font-bold border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Untitled Note"
        />

        <textarea
          value={note.content}
          onChange={(e) => handleChange("content", e.target.value)}
          className="w-full h-[60vh] resize-none border border-gray-300 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Start typing..."
        />
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm transition-all duration-300">
          ✅ Saved!
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
