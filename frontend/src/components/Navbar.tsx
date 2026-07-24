import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiUser } from "react-icons/fi";
import { getCurrentUser } from "../api/user";

export default function Navbar() {
  const navigate = useNavigate();

  const [name, setName] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getCurrentUser();
        setName(res.data.name);
      } catch (err) {
        console.error(err);
      }
    };

    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            AI
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              IntelliDoc AI
            </h1>

            <p className="text-sm text-gray-500">
              AI Document Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">

          <div className="flex items-center gap-2 text-gray-700">

            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
              <FiUser />
            </div>

            <span className="font-medium">
              Welcome, {name}
            </span>

          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            <FiLogOut />
            Logout
          </button>

        </div>

      </div>
    </header>
  );
}