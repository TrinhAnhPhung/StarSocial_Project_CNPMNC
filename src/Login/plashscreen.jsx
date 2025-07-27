// Plashscreen/plashscreen.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  // useEffect sẽ được chạy một lần sau khi component được render
  useEffect(() => {
    // Đặt một bộ đếm thời gian để chuyển trang sau 3 giây
    const timer = setTimeout(() => {
      navigate('/'); // Chuyển hướng đến trang chủ ('/')
    }, 2000); // Thời gian chờ: 3000ms = 3 giây

    // Đây là hàm cleanup, sẽ được gọi khi component bị gỡ bỏ
    // để tránh lỗi memory leak
    return () => clearTimeout(timer);
  }, [navigate]); // Dependency array, đảm bảo useEffect chỉ chạy lại nếu navigate thay đổi

  return (
    <div className="bg-white w-full h-screen flex flex-col justify-center items-center font-sans">
      <div className="flex-grow flex items-center justify-center">
  <img
    src="./src/assets/Logo.png" 
    alt="Logo Starsocial"
    width="120"
    height="120"
  />
</div>
      <div className="pb-12 text-center">
        <p className="text-gray-500">From</p>
        <p className="text-xl font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">StarTeam</p>
      </div>
    </div>
  );
};

export default SplashScreen;