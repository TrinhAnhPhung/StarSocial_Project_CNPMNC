import React  from 'react';
import { FiSearch, FiMoreHorizontal, FiSettings, FiLogOut } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { BiBlock } from 'react-icons/bi';
import { BsTextParagraph } from 'react-icons/bs';
import { HiOutlineDocumentReport } from 'react-icons/hi';

// Dữ liệu mẫu cho các tài khoản bị chặn, dựa trên hình ảnh
const bannedUsers = [
  { email: 'john.smith@gmail.com', status: 'Banned', role: 'User', bandDate: 'March 12, 2023' },
  { email: 'ollyben@gmail.com', status: 'Banned', role: 'User', bandDate: 'June 27, 2022' },
  { email: 'dwarren3@gmail.com', status: 'Banned', role: 'User', bandDate: 'January 8, 2024' },
  { email: 'chloehhye@gmail.com', status: 'Banned', role: 'User', bandDate: 'October 5, 2021' },
  { email: 'reeds777@gmail.com', status: 'Banned', role: 'User', bandDate: 'February 19, 2023' },
  { email: 'belleclark@gmail.com', status: 'Banned', role: 'User', bandDate: 'August 30, 2022' },
  { email: 'lucamich@gmail.com', status: 'Banned', role: 'User', bandDate: 'April 23, 2024' },
  { email: 'markwill32@gmail.com', status: 'Banned', role: 'User', bandDate: 'November 14, 2020' },
  { email: 'nicolass009@gmail.com', status: 'Banned', role: 'User', bandDate: 'July 6, 2023' },
  { email: 'mianaddin@gmail.com', status: 'Banned', role: 'User', bandDate: 'December 31, 2021' },
  { email: 'noemivill99@gmail.com', status: 'Banned', role: 'User', bandDate: 'August 10, 2024' },
];

// Component Table mới cho trang Block Account
const BlockAccountTable = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm">
        <thead className="text-gray-600 text-left bg-gray-50">
          <tr>
            <th className="p-4 font-medium"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></th>
            <th className="p-4 font-medium">Email</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Role</th>
            <th className="p-4 font-medium">Band Date</th>
            <th className="p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bannedUsers.map((user, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
              <td className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></td>
              <td className="p-4 font-medium text-gray-900">{user.email}</td>
              <td className="p-4">
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {user.status}
                </span>
              </td>
              <td className="p-4 text-gray-600">{user.role}</td>
              <td className="p-4 text-gray-600">{user.bandDate}</td>
              <td className="p-4">
                <button className="text-gray-500 hover:text-gray-800">
                  <FiMoreHorizontal size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Component chính của trang Blockaccount
const Blockaccount = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <BlockAccountTable />
    </div>
  );
};

export default Blockaccount;