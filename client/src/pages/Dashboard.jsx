import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { createNote, getUserNotes, getSharedNotes } from "../services/firestoreService";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myNotes, setMyNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const own = await getUserNotes(user.uid);
      const shared = await getSharedNotes(user.uid);
      setMyNotes(own);
      setSharedNotes(shared);
    };
    fetchNotes();
  }, [user]);

  const handleCreate = async () => {
  try {
    const newId = await createNote(user.uid);
    if (!newId) {
      alert("Note creation failed.");
      return;
    }
    navigate(`/notes/${newId}`);
  } catch (err) {
    console.error("Error creating note:", err.message);
    alert("Failed to create note. See console.");
  }
};


  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Welcome, {user.email}</h1>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
            >
              + New Note
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-600 mb-2">Your Notes ({myNotes.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myNotes.map(note => (
              <div
                key={note.id}
                onClick={() => navigate(`/notes/${note.id}`)}
                className="cursor-pointer bg-white p-4 rounded-lg shadow hover:bg-blue-100 transition"
              >
                <h3 className="font-semibold text-blue-700 truncate">{note.title}</h3>
                <p className="text-gray-600 text-sm mt-1 truncate">{note.content || "No content yet"}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-blue-600 mb-2">Shared With You ({sharedNotes.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sharedNotes.map(note => (
              <div
                key={note.id}
                onClick={() => navigate(`/notes/${note.id}`)}
                className="cursor-pointer bg-white p-4 rounded-lg shadow hover:bg-blue-100 transition"
              >
                <h3 className="font-semibold text-blue-700 truncate">{note.title}</h3>
                <p className="text-gray-600 text-sm mt-1 truncate">{note.content || "No content yet"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
