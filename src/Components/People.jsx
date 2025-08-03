import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const People = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // SỬA: Gọi đúng API để lấy tất cả user
                const response = await fetch('http://localhost:5000/api/users');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const formattedUsers = data.map(user => ({
                    id: user.id,
                    name: user.full_name,
                    username: user.username,
                    avatar: user.profile_picture_url,
                    isFollowing: false
                }));
                setUsers(formattedUsers);
            } catch  {
                setError("Could not load users.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleFollowToggle = (userId) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
            )
        );
    };

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="text-center p-10">Loading users...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen p-6">
            <h1 className="text-2xl font-semibold mb-6">All Users</h1>
            <div className="mb-8 relative">
                <input
                    type="text"
                    placeholder="Search users by name or username..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white rounded-lg p-4 flex flex-col items-center text-center border shadow-md">
                        <Link to={`/profile/${user.username}`} className="flex flex-col items-center flex-grow mb-4">
                            <img
                                src={user.avatar || 'https://via.placeholder.com/200'}
                                alt={`${user.name}'s Avatar`}
                                className="w-20 h-20 rounded-full object-cover mb-3"
                            />
                            <h2 className="text-lg font-semibold">{user.name || 'Unnamed User'}</h2>
                            <p className="text-gray-500 text-sm">@{user.username}</p>
                        </Link>
                        <button
                            onClick={() => handleFollowToggle(user.id)}
                            className={`w-full py-2 px-4 rounded-lg font-medium ${user.isFollowing ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                        >
                            {user.isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default People;