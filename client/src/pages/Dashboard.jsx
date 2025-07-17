import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { createNote, getUserNotes } from "../services/firestoreService";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const userNotes = await getUserNotes(user.uid);
      setNotes(userNotes);
    };
    fetchNotes();
  }, [user]);

  const handleCreate = async () => {
    const newId = await createNote(user.uid);
    navigate(`/notes/${newId}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Your Notes</h1>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
            >
              + New Note
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate(`/notes/${note.id}`)}
              className="cursor-pointer bg-white p-4 rounded-lg shadow hover:bg-blue-100 transition"
            >
              <h3 className="font-semibold text-blue-700 truncate">{note.title}</h3>
              <p className="text-gray-600 text-sm mt-1 truncate">
                {note.content ? note.content.slice(0, 80) + "..." : "No content yet"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
