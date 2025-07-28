import React from 'react';
import { FiSearch, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

const keywords = [
  { keyword: 'Má', addDate: 'March 12, 2023' },
  { keyword: 'Dơ', addDate: 'June 27, 2022' },
  { keyword: 'Đểu để', addDate: 'January 8, 2024' },
  { keyword: 'Chó đẻ', addDate: 'October 5, 2021' },
  { keyword: '...', addDate: 'February 19, 2023' },
  { keyword: '...', addDate: 'August 30, 2022' },
];

const KeywordTable = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm">
        <thead className="text-white text-left bg-gray-800">
          <tr>
            <th className="p-4 font-medium"><input type="checkbox" className="h-4 w-4 rounded border-gray-500 bg-gray-700 focus:ring-blue-500"/></th>
            <th className="p-4 font-medium">Keyword</th>
            <th className="p-4 font-medium">Add Date</th>
            <th className="p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {keywords.map((item, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></td>
              <td className="p-4 font-medium text-gray-900">{item.keyword}</td>
              <td className="p-4 text-gray-600">{item.addDate}</td>
              <td className="p-4 flex items-center gap-4">
                <button className="text-gray-400 hover:text-blue-600"><FiEdit size={16} /></button>
                <button className="text-red-500 hover:text-red-700"><FiTrash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Sensitivekey = () => {
  return (
    // Component chỉ trả về phần nội dung chính
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center justify-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors">
          <FiPlus className="mr-2" />
          Add keyword
        </button>
      </div>
      <KeywordTable />
    </div>
  );
};

export default Sensitivekey;