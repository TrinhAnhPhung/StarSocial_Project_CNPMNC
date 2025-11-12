import React from 'react';
import { FiSearch, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

const keywords = [
  { keyword: 'Asshole', addDate: 'March 12, 2023' },
  { keyword: 'Dirty', addDate: 'June 27, 2022' },
  { keyword: 'Scummy', addDate: 'January 8, 2024' },
  { keyword: 'Son of a Bitch', addDate: 'October 5, 2021' },
  { keyword: 'Damn', addDate: 'February 19, 2023' },
  { keyword: 'Bloody', addDate: 'August 30, 2022' },
];

const KeywordTable = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-transparent text-sm"> {/* Transparent table background */}
        <thead className="bg-blue-50"> {/* Table header a slightly darker pastel */}
          <tr>
            <th className="px-6 py-3 text-left">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"/>
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Keyword</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Add Date</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-100"> {/* Lighter divider */}
          {keywords.map((item, index) => (
            <tr key={index} className="hover:bg-blue-100 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"/>
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.keyword}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">{item.addDate}</td>
              <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors duration-150">
                  <FiEdit size={16} />
                </button>
                <button className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors duration-150">
                  <FiTrash2 size={16} />
                </button>
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
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Sensitive Keywords</h1>
      <div className="bg-blue-100/50 rounded-xl shadow-sm overflow-hidden border border-blue-100"> {/* Card background */}
        <div className="p-5 border-b border-blue-100 flex justify-between items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 text-sm transition-all duration-200"
            />
          </div>
          <button className="flex items-center justify-center bg-blue-400 text-white px-5 py-2.5 rounded-lg hover:bg-blue-500 transition-colors text-sm font-semibold shadow-md">
            <FiPlus className="mr-2" />
            Add Keyword
          </button>
        </div>
        <KeywordTable />
      </div>
    </div>
  );
};

export default Sensitivekey;