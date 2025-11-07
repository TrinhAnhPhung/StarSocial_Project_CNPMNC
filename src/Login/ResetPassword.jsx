import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const linkBackend = import.meta.env.VITE_Link_backend || "http://localhost:5000";

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setMessage(" Mật khẩu phải có ít nhất 6 ký tự.");
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${linkBackend}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMessage( (data.message || "Đặt lại mật khẩu thành công!"));
      } else {
        setSuccess(false);
        setMessage((data.error || "Đặt lại mật khẩu thất bại."));
      }
    } catch (error) {
      setSuccess(false);
      setMessage(" Lỗi kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 space-y-6 border border-gray-200 text-center">
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800">Đặt lại mật khẩu</h2>

        <form onSubmit={handleReset} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-green-400"
          >
            {loading ? "Đang xử lý..." : "Xác nhận đặt lại mật khẩu"}
          </button>
        </form>

        {/* Thông báo */}
        {message && (
          <div
            className={`text-sm font-medium mt-4 ${
              success ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}

        {/* Nút quay lại đăng nhập */}
        <div className="pt-4">
          <Link
            to="/login"
            className="inline-block text-sm text-blue-600 font-semibold hover:underline transition"
          >
            ← Quay lại trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
