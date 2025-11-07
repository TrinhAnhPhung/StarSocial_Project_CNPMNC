import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import IsLogin from './IsLogin';

// Helper function to format the timestamp
const formatTime = (timestamp) => {
  const now = new Date();
  const secondsPast = (now.getTime() - timestamp.getTime()) / 1000;

  if (secondsPast < 60) return `${Math.round(secondsPast)}s ago`;
  if (secondsPast < 3600) return `${Math.round(secondsPast / 60)}m ago`;
  if (secondsPast <= 86400) return `${Math.round(secondsPast / 3600)}h ago`;

  const day = timestamp.getDate();
  const month = timestamp.toLocaleString('default', { month: 'short' });
  return `${month} ${day}`;
};

const NotificationPage = () => {
  // Data updated to use Date objects for accurate grouping
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'You have a new follower!', timestamp: new Date(new Date().setHours(new Date().getHours() - 1)), details: 'User @john.doe has started following you.' },
    { id: 2, message: 'Someone liked your post.', timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 10)), details: 'Your recent post "A trip to the mountains" received a like.' },
    { id: 3, message: 'New message from another user.', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), details: 'You have a new message regarding your project proposal.' },
    { id: 4, message: 'System update: Patch available.', timestamp: new Date(new Date().setDate(new Date().getDate() - 3)), details: 'A new security patch (v2.5.1) has been applied.' },
    { id: 5, message: 'Your profile was viewed.', timestamp: new Date(new Date().setDate(new Date().getDate() - 5)), details: 'Someone viewed your public profile page.' },
  ]);

  const [expandedId, setExpandedId] = useState(null);
  const [groupedNotifications, setGroupedNotifications] = useState({});

  useEffect(() => {
    const groupNotifications = () => {
      const groups = {
        Newest: [],
        Yesterday: [],
        Earlier: [],
      };

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      notifications.forEach(notification => {
        const notificationDate = new Date(notification.timestamp);
        if (notificationDate.toDateString() === today.toDateString()) {
          groups.Newest.push(notification);
        } else if (notificationDate.toDateString() === yesterday.toDateString()) {
          groups.Yesterday.push(notification);
        } else {
          groups.Earlier.push(notification);
        }
      });
      setGroupedNotifications(groups);
    };

    groupNotifications();
  }, [notifications]);

  const handleNotificationClick = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <>
      <IsLogin />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-xl">


          <div className="relative flex justify-center items-center mb-6">
            <Link
              to="/profile"
              className="absolute left-0 text-gray-600 hover:text-gray-900"
              aria-label="Go back to profile"
            >
              <span className="material-icons text-2xl">arrow_back</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
          </div>

          <div className="space-y-6">
            {Object.keys(groupedNotifications).map(groupName => (
              groupedNotifications[groupName].length > 0 && (
                <div key={groupName}>
                  <h2 className="text-sm font-bold text-gray-500 mb-3 px-1">{groupName}</h2>
                  <div className="space-y-4">
                    {groupedNotifications[groupName].map(notification => (
                      <div key={notification.id} className="rounded-xl shadow-md overflow-hidden transition-all duration-300">
                        <div
                          className={`flex items-center p-4 cursor-pointer transform transition-all hover:bg-gray-200 ${notification.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <span className={`material-icons text-2xl mr-4 ${notification.isRead ? 'text-gray-400' : 'text-blue-500'}`}>
                            {notification.isRead ? 'notifications' : 'notifications_active'}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{notification.message}</p>
                            <p className="text-sm text-gray-500">{formatTime(notification.timestamp)}</p>
                          </div>
                          <span className={`material-icons transition-transform duration-300 ${expandedId === notification.id ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </div>

                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedId === notification.id ? 'max-h-40' : 'max-h-0'}`}>
                          <div className="px-6 py-4 border-t border-gray-200 bg-white text-gray-700">
                            <p>{notification.details}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </>

  );
};

export default NotificationPage;