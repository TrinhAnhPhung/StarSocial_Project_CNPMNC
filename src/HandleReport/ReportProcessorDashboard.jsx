import React from 'react';
// 1. Thêm FiMoreHorizontal vào import
import { FiEdit, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';

const reports = [
  {
    email: 'john.smith@gmail.com',
    image: 'https://via.placeholder.com/40',
    date: '7 thg 4, 2020',
    link: 'https://www.facebook.com',
    description: 'Trong dòng chảy thời gian',
  },
  {
    email: 'ollyben@gmail.com',
    image: 'https://via.placeholder.com/40',
    date: '16 thg 4, 2020',
    link: 'https://www.facebook.com',
    description: 'Trong dòng chảy thời gian',
  },
  // Thêm các báo cáo khác ở đây để giống với hình ảnh
];

const ReportTable = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm">
        <thead className="text-gray-600 text-left bg-gray-50">
          <tr>
            <th className="p-4 font-medium"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></th>
            <th className="p-4 font-medium">Email</th>
            <th className="p-4 font-medium">Image</th>
            <th className="p-4 font-medium">Date sent</th>
            <th className="p-4 font-medium">Link account</th>
            <th className="p-4 font-medium">Mô tả</th>
            <th className="p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
              <td className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></td>
              <td className="p-4 font-medium text-gray-900">{report.email}</td>
              <td className="p-4">
                <img src={report.image} alt="report visual" className="h-10 w-10 rounded-full object-cover" />
              </td>
              <td className="p-4 text-gray-600">{report.date}</td>
              <td className="p-4">
                <a href={report.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  https://www.facebook.com
                </a>
              </td>
              <td className="p-4 text-gray-600">{report.description}</td>
              {/* 2. Thêm button chứa icon 3 chấm */}
              <td className="p-4 flex gap-3 items-center h-full mt-3">
                <button className="text-gray-500 hover:text-blue-600"><FiEdit size={18} /></button>
                <button className="text-gray-500 hover:text-red-600"><FiTrash2 size={18} /></button>
                <button className="text-gray-500 hover:text-gray-800"><FiMoreHorizontal size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const ReportProcessorDashboard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <ReportTable />
    </div>
  );
};

export default ReportProcessorDashboard;