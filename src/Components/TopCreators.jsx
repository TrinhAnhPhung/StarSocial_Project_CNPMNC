import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TopCreators = () => {
    // Current user data
    const currentUser = {
        id: 'current',
        name: 'Trịnh Anh Phụng',
        username: '_ah.phung05',
        avatar: './src/assets/phung.jpg',
    };

    // Suggested data, with 'isFollowing' status
    const [suggestedCreators, setSuggestedCreators] = useState([
        { id: 1, name: 'Lionel Messi', username: 'leomessi', avatar: 'https://i.pravatar.cc/150?img=1', isFollowing: false },
        { id: 2, name: 'Cristiano Ronaldo', username: 'cristiano', avatar: 'https://i.pravatar.cc/150?img=2', isFollowing: false },
        { id: 3, name: 'Sơn Tùng M-TP', username: 'sontungmtp', avatar: 'https://i.pravatar.cc/150?img=3', isFollowing: false },
        { id: 4, name: 'Taylor Swift', username: 'taylorswift', avatar: 'https://i.pravatar.cc/150?img=4', isFollowing: false },
        { id: 5, name: 'HIEUTHUHAI', username: 'hieuthuhai', avatar: 'https://i.pravatar.cc/150?img=5', isFollowing: false },
    ]);

    // Handler for Follow/Following button click
    const handleFollow = (creatorId) => {
        setSuggestedCreators(prevCreators =>
            prevCreators.map(creator =>
                creator.id === creatorId
                    ? { ...creator, isFollowing: !creator.isFollowing }
                    : creator
            )
        );
    };

    return (
        <div className="text-gray-800 p-6 rounded-lg max-w-sm mx-auto">
            {/* Current user section */}
            <div className="flex items-center justify-between mb-8">
                <Link to={`/profile/${currentUser.username}`} className="flex items-center space-x-3 cursor-pointer">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <img src={currentUser.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-base">{currentUser.username}</span>
                        <span className="text-sm text-gray-500">{currentUser.name}</span>
                    </div>
                </Link>
                <button className="text-blue-500 cursor-pointer font-semibold text-sm hover:text-blue-700 transition-colors">
                    Switch
                </button>
            </div>

            {/* "Suggestions for you" title */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700 text-lg">Suggestions for you</h3>
                <Link to="/people" className="text-blue-500 font-semibold text-sm hover:text-blue-700 transition-colors">
                    See all
                </Link>
            </div>

            {/* List of suggestions */}
            <div className="space-y-2 mb-10">
                {suggestedCreators.map((creator) => (
                    <div
                        key={creator.id}
                        className="flex items-center justify-between p-2 rounded-lg transition-colors duration-300 ease-in-out hover:bg-gray-100"
                    >
                        <Link to={`/profile/${creator.username}`} className="flex items-center space-x-3 cursor-pointer">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                <img src={creator.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-base">{creator.username}</span>
                                <span className="text-sm text-gray-500">{creator.name}</span>
                            </div>
                        </Link>

                        <button
                            onClick={() => handleFollow(creator.id)}
                            className={`
                                w-24 px-4 py-1.5 rounded-lg font-semibold cursor-pointer text-sm transition-all duration-300
                                active:scale-95
                                ${creator.isFollowing
                                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }
                            `}
                        >
                            {creator.isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="text-xs text-gray-500 space-y-2">
                <p className="leading-relaxed">
                    About . Jobs . Help . API .<br />
                    Privacy . Terms . Locations
                </p>
                <p className="mt-2">@ 2025 StarSocial From Starteam</p>
            </div>
        </div>
    );
};

export default TopCreators;