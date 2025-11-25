import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import translations from "./Language/LoginLanguage.jsx";
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState("vi");
  const navigate = useNavigate();
  const t = translations[language];
  const backendLink = import.meta.env.VITE_Link_backend || "http://localhost:5000";
  
  // Debug: Log backend link khi component mount
  useEffect(() => {
    console.log("🔗 Backend URL:", backendLink);
    console.log("🔗 VITE_Link_backend:", import.meta.env.VITE_Link_backend);
  }, [backendLink]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
    setError("");
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = t.validation.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t.validation.invalidEmail;
    }
    if (!formData.password) {
      errors.password = t.validation.passwordRequired;
    } else if (formData.password.length < 3) {
      // cho phép password tối thiểu 3 ký tự vì DB có dữ liệu ngắn
      errors.password = "Mật khẩu quá ngắn";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setValidationErrors(formErrors);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log(`📤 Đang gửi request đến: ${backendLink}/api/auth/login`);
      const response = await axios.post(`${backendLink}/api/auth/login`, formData, {
        timeout: 10000, // 10 giây timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // ✅ Kiểm tra phản hồi từ server
      if (response.data && response.data.user && response.data.token) {
        const { token, user } = response.data;

        // ✅ Lưu user và token vào localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("email", user.email);
        localStorage.setItem("username", user.username);  // Lưu username vào localStorage
        localStorage.setItem("id", user.id);
        localStorage.setItem("role", user.role);  // Lưu role vào localStorage

        console.log("✅ Đăng nhập thành công, role:", user.role);

        // ✅ Điều hướng theo role
        // Xử lý cả "handlereport" và "handle report" (có thể có space trong database)
        const userRole = user.role?.toLowerCase().trim();
        
        if (userRole === "admin") {
          console.log("🔄 Chuyển hướng đến trang Admin");
          navigate("/admin");
        } else if (userRole === "handlereport" || userRole === "handle report") {
          console.log("🔄 Chuyển hướng đến trang HandleReport");
          navigate("/processor");
        } else {
          console.log("🔄 Chuyển hướng đến trang chủ");
          navigate("/plashscreen");
        }
      } else {
        setError("Thông tin đăng nhập không hợp lệ.");
      }

    } catch (err) {
      console.error("Login error:", err);
      
      // Xử lý các loại lỗi khác nhau
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError(`Không thể kết nối đến server tại ${backendLink}. Vui lòng kiểm tra:
        - Backend server đang chạy (chạy: cd Back-end && node index.js)
        - Kiểm tra file .env có VITE_Link_backend=http://localhost:5000
        - Restart frontend dev server sau khi sửa .env`);
      } else if (err.response) {
        // Server trả về lỗi
        if (err.response.status === 400) {
          setError(err.response.data?.error || "Email hoặc mật khẩu không đúng.");
        } else if (err.response.status === 403) {
          setError(err.response.data?.error || "Tài khoản của bạn đã bị khóa.");
        } else if (err.response.status === 500) {
          setError("Lỗi server. Vui lòng thử lại sau.");
        } else {
          setError(err.response.data?.error || "Đã xảy ra lỗi, vui lòng thử lại.");
        }
      } else {
        setError("Đã xảy ra lỗi, vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="bg-White text-black w-full h-screen flex flex-col justify-center items-center font-sans">
      <main className="flex flex-col lg:flex-row items-center justify-center w-full max-w-1.5xl px-4">
        <div className="hidden lg:block w-1/2">
          <img
            src="./src/assets/hinhanhgioithieu.png"
            alt="App preview"
            className="h-[300px] mr-20 self-start"
          />
        </div>

        <div className="w-full max-w-sm lg:w-1/2 mt-8 lg:mt-0 ">
          <div className="bg-white p-8 rounded-lg flex flex-col items-center">
            <h1 className="text-5xl font-serif mb-6 transition-all duration-500 ease-in-out text-black hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-400 hover:via-blue-500 hover:to-blue-600">
              StarSocial
            </h1>

            <form onSubmit={handleSubmit} className="w-full space-y-2">
              <div className="relative">
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.phoneEmailUser}
                  className={`w-full p-2 text-sm border rounded focus:outline-none ${validationErrors.email ? "border-red-500" : "border-gray-700"
                    }`}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.password}
                  className={`w-full p-2 text-sm border rounded focus:outline-none ${validationErrors.password ? "border-red-500" : "border-gray-700"
                    }`}
                />
                {formData.password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 text-sm font-semibold text-black"
                  >
                    {showPassword ? t.hide : t.show}
                  </button>
                )}
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                )}
              </div>

              {error && <p className="text-red-500 text-sm text-center mt-1">{error}</p>}
              <button
                type="submit"

                className="w-full p-2 mt-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : t.loginTitle}
              </button>
            </form>

            <div className="flex items-center w-full my-4">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="mx-4 text-xs font-semibold text-gray-400">{t.or}</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <a href="/Forgotpass" className="text-xs text-blue-400 mt-4 hover:text-black">
              {t.forgotPassword}
            </a>
          </div>

          <div className="bg-white p-4 mt-3 rounded-lg text-center text-sm">
            {t.noAccount}{" "}
            <a href="/register" className="text-blue-500 font-semibold hover:underline">
              {t.signUp}
            </a>
          </div>
        </div>
      </main>

      <footer className="text-center mt-10 text-xs text-gray-500 w-full max-w-4xl px-4">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <a href="#" className="hover:underline">{t.footer.about}</a>
          <a href="#" className="hover:underline">{t.footer.jobs}</a>
          <a href="#" className="hover:underline">{t.footer.help}</a>
          <a href="#" className="hover:underline">{t.footer.api}</a>
          <a href="#" className="hover:underline">{t.footer.privacy}</a>
          <a href="#" className="hover:underline">{t.footer.terms}</a>
          <a href="#" className="hover:underline">{t.footer.locations}</a>
        </div>
        <div className="mt-3 flex justify-center items-center gap-4">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-white text-gray-500 text-xs focus:outline-none cursor-pointer"
          >
            <option value="vi">Tiếng Việt </option>
            <option value="en">English</option>
          </select>
          <span>{t.footer.copyright}</span>
        </div>
      </footer>
    </div>
  );
};

export default Login;
