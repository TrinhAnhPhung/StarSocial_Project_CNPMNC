import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const ReportLayout = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen font-sans">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col p-6">
        {/* Outlet là nơi nội dung của các route con sẽ được hiển thị */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default ReportLayout;