// src/HandleReport/ReportProcessorDashboard.jsx
import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
// Make sure these imports are correctly configured for your project
// import { API_BASE, safeJson } from '../constants/api';
// import SafeAvatar from '../Components/SafeAvatar'; 

/* ------------------------------ Mock Helpers ------------------------------ */
// Mocking the SafeAvatar component if it's not actually present or path is different
const SafeAvatar = ({ src, alt, className }) => (
  <img 
    src={src} 
    alt={alt} 
    className={`${className} h-10 w-10 rounded-full object-cover border border-gray-200`} // Added border to avatar
    onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=N+A&background=random'; }} // Fallback for broken images
  />
);

// Function to count violations in the last 7 days
const countViolationsInLast7Days = (dates) => (dates || []).filter(
  (dateStr) => {
    const date = new Date(dateStr);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return date >= sevenDaysAgo;
  }
).length;


/* ----------------------------- Mock Data ---------------------------- */

const initialReports = [
  {
    email: 'trinhA@example.com',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    date: 'April 7, 2020',
    link: 'http://localhost:5173',
    description: 'Content contains hateful speech and discrimination towards a specific group. The post needs to be removed immediately.',
    violations: 2,
    violationDates: ['2025-11-10T10:00:00Z', '2025-11-11T11:30:00Z'], // Recent violations
  },
  {
    email: 'ollyben@example.com',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    date: 'April 16, 2020',
    link: 'http://localhost:5173',
    description: 'Post advertises electronic cigarette products, violating prohibited content policies. Consider deleting the post.',
    violations: 0,
    violationDates: [],
  },
  {
    email: 'sarah.jones@example.com',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    date: 'May 20, 2020',
    link: 'http://localhost:5173',
    description: 'Account uploaded sensitive images, violating community standards on adult content. Warning and image removal needed.',
    violations: 1,
    violationDates: ['2025-11-08T14:00:00Z'],
  },
  {
    email: 'peter.nguyen@example.com',
    image: null, // intentionally null to show fallback
    date: 'June 10, 2020',
    link: 'http://localhost:5173',
    description: 'Video shares misleading information about a medical event, causing public confusion. Video removal and warning label needed.',
    violations: 3,
    violationDates: ['2025-11-05T09:00:00Z', '2025-11-06T10:00:00Z', '2025-11-07T12:00:00Z'],
  },
];


/* ------------------------------- UI ------------------------------- */

const ReportTable = () => {
  const [reports, setReports] = useState(initialReports);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [busyIndex, setBusyIndex] = useState(null);

  // Mock API calls
  const handleMarkViolation = async (index) => {
    setBusyIndex(index);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      setReports(prev => {
        const next = [...prev];
        const r = { ...next[index] };
        r.violations = (r.violations || 0) + 1;
        r.violationDates = Array.isArray(r.violationDates)
          ? [...r.violationDates, new Date().toISOString()]
          : [new Date().toISOString()];
        next[index] = r;
        return next;
      });
      alert(`Marked violation for ${reports[index].email}. Total violations: ${reports[index].violations + 1}`);
    } catch (e) {
      alert(`Error marking violation: ${e.message}`);
    } finally {
      setBusyIndex(null);
      setOpenDropdown(null);
    }
  };

  const handleUnlock = async (index) => {
    setBusyIndex(index);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Account ${reports[index].email} unlocked.`);
    } catch (e) {
      alert(`Error unlocking account: ${e.message}`);
    } finally {
      setBusyIndex(null);
      setOpenDropdown(null);
    }
  };

  const handleToggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-transparent text-sm"> {/* Table background transparent */}
        <thead className="bg-blue-50"> {/* Table header a slightly darker pastel */}
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date Sent</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Link</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Violations</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-100"> {/* Lighter divider */}
          {reports.map((report, index) => {
            const last7 = countViolationsInLast7Days(report.violationDates);
            return (
              <tr key={index} className="hover:bg-blue-100 transition-colors duration-150"> {/* Light blue hover */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <SafeAvatar
                      src={report.image}
                      alt={`Avatar ${report.email}`}
                      className="h-10 w-10"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{report.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{report.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* *** PHẦN BỊ CẮT LÀ Ở ĐÂY *** */}
                  <a
                    href={report.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                  >
                    View Link
                  </a>
                  {/* *** KẾT THÚC SỬA LỖI *** */}
                </td>
                <td className="px-6 py-4 text-gray-700 max-w-xs break-words">{report.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col items-start gap-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      report.violations > 0
                        ? 'bg-red-100 text-red-700' // Brighter red for total violations
                        : 'bg-green-100 text-green-700'
                    }`}>
                      Total: {report.violations}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      last7 > 0
                        ? 'bg-yellow-100 text-yellow-800' // Yellow pastel for 7-day count
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      Last 7 days: {last7}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right relative">
                  <div className="flex gap-1 justify-end items-center">
                    <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors duration-150">
                      <FiEdit size={16} />
                    </button>
                    <button className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors duration-150">
                      <FiTrash2 size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleDropdown(index)}
                      className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-colors duration-150"
                    >
                      <FiMoreHorizontal size={16} />
                    </button>
                  </div>
                  {openDropdown === index && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-xl z-10 animate-fade-in">
                      <ul className="py-1">
                        <li>
                          <button
                            onClick={() => handleMarkViolation(index)}
                            disabled={busyIndex === index}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 disabled:opacity-60 transition-colors"
                          >
                            {busyIndex === index
                              ? 'Processing...'
                              : `Mark Violation (${report.violations} / 3)`}
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => alert(`Banned account ${report.email}.`)} // Should call a real function
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Ban Account
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleUnlock(index)}
                            disabled={busyIndex === index}
                            className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 disabled:opacity-60 transition-colors"
                          >
                            {busyIndex === index ? 'Unlocking...' : 'Unlock Account'}
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Component chính, bọc trong div với nền pastel card
const ReportProcessorDashboard = () => (
  <div>
    <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Violating Posts</h1>
    <div className="bg-blue-100/50 rounded-xl shadow-sm overflow-hidden border border-blue-100">
      <ReportTable />
    </div>
  </div>
);

export default ReportProcessorDashboard;  