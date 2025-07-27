import React, { useState } from 'react';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiMoreHorizontal, FiChevronDown, FiLogOut, FiSettings } from 'react-icons/fi';
import { FaStar } from "react-icons/fa";
import { CgData } from "react-icons/cg";

const users = [
    { email: 'john.smith@gmail.com', status: 'Active', role: 'Admin', joinedDate: 'March 12, 2023' },
    { email: 'ollyben@gmail.com', status: 'Inactive', role: 'User', joinedDate: 'June 27, 2022' },
    { email: 'dwarren3@gmail.com', status: 'Banned', role: 'User', joinedDate: 'January 8, 2024' },
    { email: 'chloehhye@gmail.com', status: 'Pending', role: 'Guest', joinedDate: 'October 5, 2021' },
    { email: 'reeds777@gmail.com', status: 'Suspended', role: 'User', joinedDate: 'February 19, 2023' },
    { email: 'belleclark@gmail.com', status: 'Active', role: 'Moderator', joinedDate: 'August 30, 2022' },
    { email: 'lucamich@gmail.com', status: 'Active', role: 'Guest', joinedDate: 'April 23, 2024' },
    { email: 'markwill32@gmail.com', status: 'Banned', role: 'User', joinedDate: 'November 14, 2020' },
    { email: 'nicolass009@gmail.com', status: 'Suspended', role: 'User', joinedDate: 'July 6, 2023' },
    { email: 'mianaddiin@gmail.com', status: 'Inactive', role: 'Guest', joinedDate: 'December 31, 2021' },
    { email: 'noemivill99@gmail.com', status: 'Active', role: 'Admin', joinedDate: 'August 10, 2024' },
];

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-sm rounded-full font-semibold";
    const statusClasses = {
        Active: 'bg-green-100 text-green-700',
        Inactive: 'bg-gray-200 text-gray-800',
        Banned: 'bg-red-200 text-red-800',
        Pending: 'bg-blue-200 text-blue-800',
        Suspended: 'bg-yellow-200 text-yellow-800',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const Sidebar = () => {
    const [showMore, setShowMore] = useState(false);

    return (
        <aside className="w-64 bg-white fixed top-0 left-0 bottom-0 border-r shadow z-50 flex flex-col justify-between">
            <div>
                <div className="h-20 flex items-center px-6 border-b">
                    <FaStar className="text-blue-500 text-3xl mr-3" />
                    <h1 className="text-xl font-bold">Hello <span className="text-blue-600">Admin</span></h1>
                </div>
                <nav className="px-4 py-6 space-y-2">
                    <a href="#" className="flex items-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        <CgData className="mr-3 text-xl" />
                        Decentralization
                    </a>
                </nav>
            </div>

            {/* More button at bottom */}
            <div className="px-4 py-4 relative">
                <button
                    onClick={() => setShowMore(!showMore)}
                    className="flex items-center w-full text-left text-gray-700 hover:text-black"
                >
                    <FiMoreHorizontal className="mr-3 text-xl" />
                    More
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

const Header = () => {
    return (
        <header className="flex items-center justify-between p-6 bg-white shadow sticky top-0 z-40 ml-64">
            <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search"
                    className="pl-10 pr-4 py-2 w-80 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                <FiPlus className="mr-2" /> Add User
            </button>
        </header>
    );
};

const UserTable = () => {
    return (
        <div className="px-6 py-4">
            <table className="min-w-full bg-white">
                <thead>
                    <tr className='text-left text-gray-500'>
                        <th className="p-4 w-12"><input type="checkbox" /></th>
                        <th className="p-4">Email <FiChevronDown className="inline ml-1" /></th>
                        <th className="p-4">Status <FiChevronDown className="inline ml-1" /></th>
                        <th className="p-4">Role <FiChevronDown className="inline ml-1" /></th>
                        <th className="p-4">Joined Date <FiChevronDown className="inline ml-1" /></th>
                        <th className="p-4">Actions <FiChevronDown className="inline ml-1" /></th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="p-4"><input type="checkbox" /></td>
                            <td className="p-4 font-medium text-gray-800">{user.email}</td>
                            <td className="p-4"><StatusBadge status={user.status} /></td>
                            <td className="p-4 text-gray-600">{user.role}</td>
                            <td className="p-4 text-gray-600">{user.joinedDate}</td>
                            <td className="p-4">
                                <button className="text-gray-500 hover:text-blue-600 mr-4"><FiEdit size={18}/></button>
                                <button className="text-gray-500 hover:text-red-600"><FiTrash2 size={18}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AdminPage = () => {
    return (
        <div className="flex bg-gray-100 min-h-screen font-sans">
            <Sidebar />
            <main className="ml-64 flex-1 flex flex-col">
                <Header />
                <div className="bg-white m-6 rounded-lg shadow">
                    <UserTable />
                </div>
            </main>
        </div>
    );
};

export default AdminPage;
