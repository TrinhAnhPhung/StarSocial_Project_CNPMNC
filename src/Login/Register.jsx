// Register.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/Register",
        formData
      );
      setSuccessMessage(response.data.message || "Đăng ký thành công!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full">
      {/* Left: Register Form */}
      <div className="flex flex-col justify-center items-center bg-black w-full lg:w-1/2 p-8">
        <div className="bg-gray-800 p-8 rounded-lg w-full max-w-sm">
          <span className="flex items-center justify-center space-x-4">
            <img src="./src/assets/Logo.png" className="w-20" alt="Logo" />
            <h3 className="text-4xl font-semibold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-[#60a5fa]">
              Starsocial
            </h3>
          </span>

          <h3 className="text-3xl font-semibold text-center text-white mt-4">Đăng ký</h3>
          <p className="text-sm text-center text-gray-400 mt-2">
            Để sử dụng Starsocial, vui lòng nhập thông tin của bạn
          </p>

          <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tên đầy đủ"
              className="w-full px-4 py-2 rounded-lg bg-gray-600 text-white placeholder-gray-400"
            />
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Tên người dùng"
              className="w-full px-4 py-2 rounded-lg bg-gray-600 text-white placeholder-gray-400"
            />
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 rounded-lg bg-gray-600 text-white placeholder-gray-400"
            />
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mật khẩu"
              className="w-full px-4 py-2 rounded-lg bg-gray-600 text-white placeholder-gray-400"
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex justify-center"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-400">
            Đã có tài khoản?{" "}
            <a href="/login" className="text-blue-400 hover:underline">
              Đăng nhập
            </a>
          </p>
        </div>
      </div>

      {/* Right: Image */}
      <div className="hidden lg:block w-1/2 h-screen">
        <img
          src="./src/assets/side-img.jpg"
          alt="Register side"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Register;
