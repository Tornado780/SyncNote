import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Welcome, {user?.email}</h1>
      <button onClick={handleLogout} className="mt-4 bg-red-600 text-white px-4 py-2">Logout</button>
    </div>
  );
};

export default Dashboard;