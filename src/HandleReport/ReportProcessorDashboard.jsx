import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiMoreHorizontal, FiSettings, FiLogOut } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { BiBlock } from 'react-icons/bi';
import { BsTextParagraph } from 'react-icons/bs';
import { HiOutlineDocumentReport } from 'react-icons/hi';

const reports = [
  {
    email: 'john.smith@gmail.com',
    image: 'https://encrypted-tbn0',
    date: '7 thg 4, 2020',
    link: 'https://www.facebook.com',
    description: 'Trong dòng chảy thời gian',
  },
  // ... lặp lại cho 10 dòng dữ liệu mẫu như ảnh bạn gửi
];

const Sidebar = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <aside className="w-64 bg-white fixed top-0 left-0 bottom-0 border-r shadow flex flex-col justify-between z-50">
      <div>
        <div className="h-20 flex items-center px-6 border-b">
          <FaStar className="text-blue-500 text-3xl mr-3" />
          <h1 className="text-xl font-bold leading-5">
            Hello <span className="text-blue-600">Report<br />Processor</span>
          </h1>
        </div>
        <nav className="px-4 py-6 space-y-2 text-sm font-medium text-gray-700">
          <a href="#" className="flex items-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <HiOutlineDocumentReport className="mr-3 text-xl" />
            Violating posts
          </a>
          <a href="#" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100">
            <BiBlock className="mr-3 text-xl" />
            Block account
          </a>
          <a href="#" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100">
            <BsTextParagraph className="mr-3 text-xl" />
            Sensitive keyword statistics
          </a>
        </nav>
      </div>

      <div className="px-4 py-4 relative">
        <button onClick={() => setShowMore(!showMore)} className="flex items-center w-full text-left text-gray-700 hover:text-black">
          <FiMoreHorizontal className="mr-3 text-xl" /> More
        </button>
        {showMore && (
          <div className="absolute bottom-16 left-4 bg-white border shadow-lg rounded w-40 z-10">
            <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm">
              <FiSettings className="mr-2" /> Settings
            </button>
            <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm text-red-600">
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

const ReportTable = () => {
  return (
    <div className="px-6 py-6">
      <table className="min-w-full bg-white text-sm">
        <thead className="text-gray-600 text-left">
          <tr>
            <th className="p-4"><input type="checkbox" /></th>
            <th className="p-4">Email</th>
            <th className="p-4">Image</th>
            <th className="p-4">Date sent</th>
            <th className="p-4">Link account</th>
            <th className="p-4">Mô tả</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
              <td className="p-4"><input type="checkbox" /></td>
              <td className="p-4">{report.email}</td>
              <td className="p-4">{report.image}</td>
              <td className="p-4">{report.date}</td>
              <td className="p-4">
                <a href={report.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {report.link.split('//')[1].split('.')[0]}
                </a>
              </td>
              <td className="p-4">{report.description}</td>
              <td className="p-4 flex gap-3">
                <button className="text-gray-500 hover:text-blue-600"><FiEdit size={18} /></button>
                <button className="text-gray-500 hover:text-red-600"><FiTrash2 size={18} /></button>
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
    <div className="flex bg-gray-100 min-h-screen font-sans">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col">
        <div className="bg-white m-6 rounded-lg shadow">
          <ReportTable />
        </div>
      </main>
    </div>
  );
};

export default ReportProcessorDashboard;
