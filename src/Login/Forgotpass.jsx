import React, { useState } from "react";

// Component Link giả lập, giữ nguyên
const Link = ({ to, children, className }) => (
  <a href={to} className={className}>{children}</a>
);

// 🌐 Song ngữ (Giữ nguyên)
const translations = {
  vi: {
    headerLogin: "Đăng nhập",
    headerSignup: "Đăng ký",
    title: "Bạn gặp sự cố khi đăng nhập?",
    instructions: "Nhập email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.",
    placeholder: "Nhập email của bạn",
    sendLinkButton: "Gửi liên kết đặt lại",
    loadingText: "Đang gửi...",
    successMsg: "Đã gửi liên kết đặt lại mật khẩu đến email của bạn!", // Bỏ dấu ✅
    errorMsg: "Không thể gửi email. Vui lòng thử lại sau.", // Bỏ dấu ❌
    cantReset: "Bạn không thể đặt lại mật khẩu?",
    or: "HOẶC",
    createNewAccount: "Tạo tài khoản mới",
    backToLogin: "Quay lại đăng nhập",
    footer: {
      about: "Giới thiệu",
      jobs: "Việc làm",
      help: "Trợ giúp",
      api: "API",
      privacy: "Quyền riêng tư",
      terms: "Điều khoản",
      locations: "Vị trí",
      copyright: "© 2025 Starsocial from HPT team",
    },
  },
  en: {
    // ... (Giữ nguyên phần tiếng Anh) ...
  },
};

const Forgotpass = () => {
  const [language, setLanguage] = useState("vi");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // ✅ SỬA LỖI 1: Thêm state 'messageType' để quản lý màu sắc (thành công/lỗi)
  const [messageType, setMessageType] = useState("error"); 
  const linkBackend = import.meta.env.VITE_Link_backend || "http://localhost:5000";

  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("error"); // Reset về mặc định là lỗi

    try {
      const res = await fetch(`${linkBackend}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ SỬA LỖI 1: Đặt loại tin nhắn là "thành công"
        setMessageType("success");
        // Bỏ logic 'previewUrl' vì backend không gửi về
        setMessage(t.successMsg); 
      } else {
        // ✅ SỬA LỖI 1: Đặt loại tin nhắn là "lỗi"
        setMessageType("error");
        setMessage(data.error || t.errorMsg);
      }
    } catch (error) {
      // ✅ SỬA LỖI 1: Đặt loại tin nhắn là "lỗi"
      setMessageType("error");
      setMessage(" Lỗi kết nối tới máy chủ.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-dvh flex flex-col font-sans">
      {/* Header (Giữ nguyên) */}
      <header className="w-full bg-white py-3 px-6 sm:px-8 flex justify-between items-center border-b border-gray-200 shadow-sm">
        {/* ... (Code JSX của Header giữ nguyên) ... */}
         <Link to="/Login" className="text-2xl font-bold tracking-wider text-black font-serif">
          Starsocial
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold text-white">
            {t.headerLogin}
          </Link>
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            {t.headerSignup}
          </Link>
        </div>
      </header>

      {/* Main (Sửa phần Message) */}
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 sm:p-10 text-center">
            {/* ... (Phần Icon, Title, Form giữ nguyên) ... */}
            <div className="mb-6 bg-blue-100 rounded-full p-5 inline-block">
              <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold">{t.title}</h2>
            <p className="text-sm text-gray-600 my-4">{t.instructions}</p>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <input
                type="email"
                placeholder={t.placeholder}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-3 transition disabled:bg-blue-400"
              >
                {loading ? t.loadingText : t.sendLinkButton}
              </button>
            </form>

            {/* ✅ SỬA LỖI 2: Sửa logic hiển thị Message */}
            {message && (
              <div
                className={`mt-6 text-sm text-center ${
                  // Dùng messageType để quyết định màu sắc
                  messageType === "success" ? "text-green-600" : "text-red-500"
                }`}
              >
                {/* Bỏ 'dangerouslySetInnerHTML' và render text trực tiếp 
                    để vá lỗ hổng bảo mật XSS */}
                {message}
              </div>
            )}
            
            {/* ... (Phần còn lại của Main giữ nguyên) ... */}
            <a href="#" className="text-blue-600 hover:underline text-xs mt-6 font-semibold">
              {t.cantReset}
            </a>

            <div className="flex items-center w-full my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-xs font-bold text-gray-400">{t.or}</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <Link to="/register" className="text-sm font-semibold text-gray-800 hover:text-blue-600">
              {t.createNewAccount}
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-lg py-5 text-center">
            <Link to="/login" className="text-sm font-semibold text-blue-600 hover:underline">
              {t.backToLogin}
            </Link>
          </div>
          
        </div>
      </main>

      {/* Footer (Giữ nguyên) */}
      <footer className="text-center py-8 text-xs text-gray-500 w-full max-w-5xl mx-auto px-4">
        {/* ... (Code JSX của Footer giữ nguyên) ... */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-4">
          <a href="#" className="hover:underline">{t.footer.about}</a>
          <a href="#" className="hover:underline">{t.footer.jobs}</a>
          <a href="#" className="hover:underline">{t.footer.help}</a>
          <a href="#" className="hover:underline">{t.footer.api}</a>
          <a href="#" className="hover:underline">{t.footer.privacy}</a>
          <a href="#" className="hover:underline">{t.footer.terms}</a>
          <a href="#" className="hover:underline">{t.footer.locations}</a>
        </div>
        <div className="flex justify-center items-center gap-4 mt-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-gray-500 text-xs cursor-pointer p-1"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
          <span>{t.footer.copyright}</span>
        </div>
      </footer>
    </div>
  );
};

export default Forgotpass;