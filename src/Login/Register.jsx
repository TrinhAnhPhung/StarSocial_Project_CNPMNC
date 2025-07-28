// Register.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    // Đổi 'email' lên đầu để khớp với giao diện
    email: "",
    name: "",
    username: "",
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
        "http://localhost:5000/api/auth/register",
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
    <div className="bg-white flex flex-col justify-center items-center min-h-screen font-sans">
      <div className="w-full max-w-sm">
        {/* Main Register Box */}
        <div className="border border-gray-300 p-10 rounded-sm">
          <h1 className="text-5xl font-serif text-center text-black mb-4">
            StarSocial
          </h1>
          <p className="text-gray-500 font-semibold text-center mb-4">
            Đăng ký để xem ảnh và video từ bạn bè.
          </p>

          <button className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 mb-4">
            Đăng nhập bằng Google
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 font-semibold text-sm">HOẶC</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form className="space-y-2" onSubmit={handleSubmit}>
            <input
              id="email"
              type="text" // Cho phép cả email và sđt
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 text-black placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tên đầy đủ"
              className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 text-black placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Tên người dùng"
              className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 text-black placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mật khẩu"
              className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 text-black placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            
            <div className="pt-2">
                 <p className="text-xs text-center text-gray-500">
                    Những người dùng dịch vụ của chúng tôi có thể đã tải thông tin liên hệ của bạn lên Instagram. <a href="#" className="text-blue-900">Tìm hiểu thêm</a>
                </p>
                 <p className="text-xs text-center text-gray-500 mt-2">
                    Bằng cách đăng ký, bạn đồng ý với <a href="#" className="text-blue-900">Điều khoản</a>, <a href="#" className="text-blue-900">Chính sách quyền riêng tư</a> và <a href="#" className="text-blue-900">Chính sách cookie</a> của chúng tôi.
                </p>
            </div>


            {error && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}
            {successMessage && <p className="text-green-500 text-xs text-center pt-2">{successMessage}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-400 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-blue-300 mt-4"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>
        </div>

        {/* Login Link Box */}
        <div className="border border-gray-300 p-4 mt-3 rounded-sm text-center">
          <p className="text-sm text-black">
            Bạn có tài khoản?{" "}
            <a href="/login" className="text-blue-500 font-semibold hover:underline">
              Đăng nhập
            </a>
          </p>
        </div>
      </div>

       {/* Footer */}
       <footer className="text-center mt-10 p-4">
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2">
                <a href="#" className="text-xs text-gray-500">Giới thiệu</a>
                <a href="#" className="text-xs text-gray-500">Việc làm</a>
                <a href="#" className="text-xs text-gray-500">Trợ giúp</a>
                <a href="#" className="text-xs text-gray-500">API</a>
                <a href="#" className="text-xs text-gray-500">Quyền riêng tư</a>
                <a href="#" className="text-xs text-gray-500">Điều khoản</a>
                <a href="#" className="text-xs text-gray-500">Vị trí</a>
            </div>
            <div className="mt-4 text-xs text-gray-500">
                <span>Tiếng Việt</span>
                <span className="ml-4">© 2025 Starsocial from StarTeam</span>
            </div>
        </footer>
    </div>
  );
};

export default Register;