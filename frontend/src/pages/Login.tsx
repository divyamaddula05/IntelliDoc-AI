import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await loginUser({
        email,
        password,
      });

      localStorage.setItem(
        "token",
        res.data.access_token
      );

      navigate("/dashboard");

    } catch (err: any) {

      setError(
        err.response?.data?.detail ||
        "Invalid email or password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-blue-700">
            IntelliDoc AI
          </h1>

          <p className="text-gray-500 mt-2">
            Chat with your documents using AI
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>

            <label className="font-medium">
              Email
            </label>

            <div className="flex items-center border rounded-xl mt-2 px-4">

              <FiMail className="text-gray-400" />

              <input
                type="email"
                className="flex-1 p-3 outline-none"
                placeholder="Enter your email"
                value={email}
                onChange={(e)=>
                  setEmail(e.target.value)
                }
              />

            </div>

          </div>

          <div>

            <label className="font-medium">
              Password
            </label>

            <div className="flex items-center border rounded-xl mt-2 px-4">

              <FiLock className="text-gray-400"/>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="flex-1 p-3 outline-none"
                placeholder="Enter password"
                value={password}
                onChange={(e)=>
                  setPassword(e.target.value)
                }
              />

              <button
                type="button"
                onClick={()=>
                  setShowPassword(!showPassword)
                }
              >

                {
                  showPassword
                    ? <FiEyeOff/>
                    : <FiEye/>
                }

              </button>

            </div>

          </div>

          {
            error &&

            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">

              {error}

            </div>
          }

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-xl p-3 font-semibold hover:bg-blue-700 transition"
          >

            {
              loading
                ? "Signing In..."
                : "Login"
            }

          </button>

        </form>

        <div className="text-center mt-6">

          <span className="text-gray-600">

            Don't have an account?

          </span>

          <Link
            to="/register"
            className="text-blue-600 font-semibold ml-2"
          >

            Register

          </Link>

        </div>

      </div>

    </div>
  );
}