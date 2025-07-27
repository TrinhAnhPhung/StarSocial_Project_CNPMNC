import React from 'react';

const Navbar = () => {
    return (
        <nav className="bg-gray-900 text-white p-4">
            <div className="flex justify-between items-center">
                <div className="text-lg font-bold">Snapgram</div>
                <ul className="flex space-x-6">
                    <li className="hover:text-gray-400">Home</li>
                    <li className="hover:text-gray-400">Explore</li>
                    <li className="hover:text-gray-400">People</li>
                    <li className="hover:text-gray-400">Create Post</li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;