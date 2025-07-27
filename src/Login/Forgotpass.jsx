import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// THÊM MỚI: Đối tượng chứa các chuỗi văn bản cho 2 ngôn ngữ
const translations = {
  vi: {
    headerLogin: "Đăng nhập",
    headerSignup: "Đăng ký",
    title: "Bạn gặp sự cố khi đăng nhập?",
    instructions: "Nhập email, số điện thoại hoặc tên người dùng của bạn và chúng tôi sẽ gửi cho bạn một liên kết để truy cập lại vào tài khoản.",
    placeholder: "Email, điện thoại hoặc tên người dùng",
    sendLinkButton: "Gửi liên kết đăng nhập",
    cantReset: "Bạn không thể đặt lại mật khẩu?",
    or: "HOẶC",
    createNewAccount: "Tạo tài khoản mới",
    backToLogin: "Quay lại đăng nhập",
    footer: {
      about: "Giới thiệu",
      blog: "Blog",
      jobs: "Việc làm",
      help: "Trợ giúp",
      api: "API",
      privacy: "Quyền riêng tư",
      terms: "Điều khoản",
      locations: "Vị trí",
      copyright: "© 2025 Starsocial form HPT team",
    },
  },
  en: {
    headerLogin: "Log in",
    headerSignup: "Sign up",
    title: "Trouble logging in?",
    instructions: "Enter your email, phone, or username and we'll send you a link to get back into your account.",
    placeholder: "Email, phone, or username",
    sendLinkButton: "Send login link",
    cantReset: "Can't reset your password?",
    or: "OR",
    createNewAccount: "Create new account",
    backToLogin: "Back to login",
    footer: {
      about: "About",
      blog: "Blog",
      jobs: "Jobs",
      help: "Help",
      api: "API",
      privacy: "Privacy",
      terms: "Terms",
      locations: "Locations",
      copyright: "© 2025 Starsocial from HPT team",
    },
  },
};

const Forgotpass = () => {
  const [language, setLanguage] = useState("vi");

  // Hàm xử lý khi người dùng gửi form
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
    // TODO: Thêm logic gửi email/SMS tại đây
  };

  // Hàm xử lý thay đổi ngôn ngữ
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  // Biến 't' để truy cập các chuỗi văn bản theo ngôn ngữ hiện tại
  const t = translations[language];

  return (
    <div className="bg-white text-gray-200 min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto py-4 px-8 flex justify-between items-center">
        <Link to="/Login" className="text-2xl font-serif tracking-wider text-black">
          Starsocial
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold">
            {t.headerLogin}
          </Link>
          <Link to="/register" className="text-blue-400 hover:text-black font-semibold text-sm">
            {t.headerSignup}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        {/* Hộp nội dung chính */}
        <div className="w-full max-w-sm text-center flex flex-col items-center">
          <div className="mb-6">
            <svg
              className="w-20 h-20 border-2 border-gray-400 rounded-full p-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="text-lg font-semibold">{t.title}</h2>
          <p className="text-sm text-gray-400 my-4 px-4">
            {t.instructions}
          </p>

          <form onSubmit={handleSubmit} className="w-full px-4 flex flex-col gap-3">
            <input
              type="text"
              placeholder={t.placeholder}
              className="bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md p-2.5 disabled:opacity-50"
            >
              {t.sendLinkButton}
            </button>
          </form>

          <a href="#" className="text-blue-400 text-xs mt-6">
            {t.cantReset}
          </a>

          <div className="flex items-center w-full my-6 px-4">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="mx-4 text-xs font-semibold text-gray-500">{t.or}</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <Link to="/register" className="font-semibold text-sm">
            {t.createNewAccount}
          </Link>
        </div>

        {/* Hộp link "Quay lại đăng nhập" */}
        <div className="w-full max-w-sm mt-8 py-4 border-t border-gray-700 text-center">
            <Link to="/login" className="font-semibold text-sm text-blue-400 hover:text-blue-300">
                {t.backToLogin}
            </Link>
        </div>
      </main>

      {/* Footer chung */}
      <footer className="text-center pb-6 text-xs text-gray-500 w-full max-w-4xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-3">
          <a href="#" className="hover:underline">{t.footer.about}</a>
          <a href="#" className="hover:underline">{t.footer.jobs}</a>
          <a href="#" className="hover:underline">{t.footer.help}</a>
          <a href="#" className="hover:underline">{t.footer.api}</a>
          <a href="#" className="hover:underline">{t.footer.privacy}</a>
          <a href="#" className="hover:underline">{t.footer.terms}</a>
          <a href="#" className="hover:underline">{t.footer.locations}</a>
        </div>
        <div className="flex justify-center items-center gap-4">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-black text-gray-400 text-xs focus:outline-none cursor-pointer border border-gray-700 rounded p-1"
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