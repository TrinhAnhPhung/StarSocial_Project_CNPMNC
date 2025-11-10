import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Renamed to RegisterComponent and passed setPage for navigation
const RegisterComponent = ({ setPage }) => {
  const [formData, setFormData] = useState({
    email: "",
    // Thay đổi 'name' thành 'first_name' và 'last_name'
    first_name: "",
    last_name: "",
    // Đã xóa trường 'username'
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const linkBackend = import.meta.env.VITE_Link_backend || "http://localhost:5000";
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
      // formData bây giờ sẽ gửi first_name và last_name (không có username)
      const response = await axios.post(
        `${linkBackend}/api/auth/register`,
        formData
      );
      setSuccessMessage(response.data.message || "Đăng ký thành công!");
      // Redirect to /Login route after successful registration
      setTimeout(() => {
        navigate("/Login");
      }, 1500);
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
            {/* Thêm trường Họ (last_name) */}
            <input
              id="last_name"
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Họ"
              className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 text-black placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            {/* Đổi 'name' thành 'first_name' và placeholder */}
            <input
              id="first_name"
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Tên"
              className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 text-black placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            {/* ĐÃ XÓA TRƯỜNG INPUT TÊN NGƯỜI DÙNG (USERNAME) */}
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
            {/* Replaced <a href... with <span> onClick */}
            <span
              onClick={() => setPage('login')}
              className="text-blue-500 font-semibold hover:underline cursor-pointer"
            >
              Đăng nhập
            </span>
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

// Added a placeholder Login component for navigation
const LoginComponent = ({ setPage }) => {
  return (
    <div className="bg-white flex flex-col justify-center items-center min-h-screen font-sans">
      <div className="w-full max-w-sm">
        <div className="border border-gray-300 p-10 rounded-sm">
          <h1 className="text-5xl font-serif text-center text-black mb-4">
            StarSocial
          </h1>
          <p className="text-gray-500 font-semibold text-center mb-4">
            Đăng nhập (Placeholder)
          </p>
          <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Email"
              className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 text-black placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 text-black placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-400 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-blue-300 mt-4"
            >
              Đăng nhập
            </button>
          </form>
        </div>
        <div className="border border-gray-300 p-4 mt-3 rounded-sm text-center">
          <p className="text-sm text-black">
            Bạn chưa có tài khoản?{" "}
            <span
              onClick={() => setPage('register')}
              className="text-blue-500 font-semibold hover:underline cursor-pointer"
            >
              Đăng ký
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

// Added main App component to manage navigation state
const App = () => {
  const [page, setPage] = useState('register'); // Default to register page

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginComponent setPage={setPage} />;
      case 'register':
      default:
        return <RegisterComponent setPage={setPage} />;
    }
  };

  return (
    <>
      {renderPage()}
    </>
  );
};

// Changed default export to App
export default App;

