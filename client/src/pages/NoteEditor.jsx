import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { listenToNote, updateNote } from "../services/firestoreService";

const NoteEditor = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);

  useEffect(() => {
    const unsub = listenToNote(id, setNote);
    return () => unsub();
  }, [id]);

  const handleChange = (field, value) => {
    setNote((prev) => ({ ...prev, [field]: value }));
    updateNote(id, { [field]: value });
  };

  if (!note) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-4">
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
    </div>
  );
};

export default NoteEditor;
