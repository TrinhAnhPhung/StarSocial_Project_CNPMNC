import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const ReportLayout = () => {
  return (
    // THAY ĐỔI: Đổi nền `bg-blue-50` thành `bg-slate-800`
    <div className="flex bg-slate-800 min-h-screen font-sans">
      <Sidebar />
      
      <main className="ml-64 flex-1 flex flex-col w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default ReportLayout;