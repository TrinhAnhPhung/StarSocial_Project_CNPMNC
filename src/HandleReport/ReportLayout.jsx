import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const ReportLayout = () => {
  return (
    // Main background: a very light, soothing pastel blue
    <div className="flex bg-blue-50 min-h-screen font-sans">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ReportLayout;