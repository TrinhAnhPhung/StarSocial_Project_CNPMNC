import React, { useState, useEffect } from 'react'; // Thêm useState, useEffect
import Sidebar from './Components/Sidebar';
import TopCreators from './Components/TopCreators';
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // Thêm useNavigate
import { usePopup } from './Components/IsPopup';
// import { is } from 'date-fns/locale'; // (Bạn không dùng cái này, có thể xóa)

const MainLayout = () => {
  const { isPopup } = usePopup();
  const location = useLocation();
  
  // --- PHẦN CODE MỚI ---
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const linkBackend = import.meta.env.VITE_Link_backend || "http://localhost:5000";

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("MainLayout: Không có token, về /login");
        navigate('/login');
        return;
      }

      try {
        // ⚠️ LƯU Ý: Đổi '/api/profile/me' thành API endpoint ĐÚNG
        // để lấy thông tin user TỪ TOKEN.
        const response = await fetch(`${linkBackend}/api/profile/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            navigate('/login');
          }
          throw new Error("Không thể xác thực người dùng");
        }
        
        const userData = await response.json();
        console.log("MainLayout: Đã tải user thành công", userData);
        setUser(userData); 
        
      } catch (error) {
        console.error("Lỗi fetchUser trong MainLayout:", error);
        localStorage.removeItem("token");
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate, linkBackend]);

  // Hiển thị màn hình tải trong khi chờ user
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p className="text-2xl">Đang tải dữ liệu...</p>
      </div>
    );
  }
  // --- HẾT PHẦN CODE MỚI ---

  return (
    <>
      {isPopup ? (
        <div className="flex bg-white-900">
          {/* Sidebar - ẩn trên mobile, hiển thị trên tablet+ */}
          <div className="hidden md:block sticky top-0 w-64 h-screen z-30">
            <Sidebar />
          </div>
          {/* Main content - full width trên mobile */}
          <div className="flex-1 p-2 md:p-4 w-full min-w-0">
            {/* Truyền user xuống cho mọi component con (ChatModal, Feed...) */}
            <Outlet context={{ user }} />
          </div>
          {/* Right sidebar - ẩn trên People page */}
          {!location.pathname.startsWith('/people') && (
            <div className="hidden lg:block sticky top-0 w-1/4 bg-white-800 p-4 text-white h-screen overflow-auto">
              <TopCreators />
            </div>
          )}
        </div>
      ) : (
        <div className="flex bg-white-900">
          {/* Sidebar - ẩn trên mobile, hiển thị trên tablet+ */}
          <div className="hidden md:block sticky top-0 w-20 h-screen z-30">
            <Sidebar />
          </div>
          {/* Main content - full width trên mobile */}
          <div className="flex-1 p-0 w-full min-w-0">
            {/* Truyền user xuống cho mọi component con (ChatModal, Feed...) */}
            <Outlet context={{ user }} />
          </div>
          {/* Right sidebar - ẩn trên People page */}
          {!location.pathname.startsWith('/people') && (
            <div className="hidden lg:block sticky top-0 w-1/4 bg-white-800 p-4 text-white h-screen overflow-auto">
              <TopCreators />
            </div>
          )}
        </div>
      )}
      {/* Mobile bottom navigation - chỉ hiển thị trên mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <Sidebar />
      </div>
      {/* Padding bottom cho mobile để tránh content bị che bởi bottom nav */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default MainLayout;