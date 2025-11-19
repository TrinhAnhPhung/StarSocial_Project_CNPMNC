import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { getImageUrl } from '../utils/imageUtils';

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const secondsPast = (now - date) / 1000;

  if (secondsPast < 60) return `${Math.round(secondsPast)}s ago`;
  if (secondsPast < 3600) return `${Math.round(secondsPast / 60)}m ago`;
  if (secondsPast <= 86400) return `${Math.round(secondsPast / 3600)}h ago`;

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  return `${month} ${day}`;
};

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const linkBackend = import.meta.env.VITE_Link_backend || 'http://localhost:5000';

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        setError('Chưa đăng nhập.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${linkBackend}/api/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Không thể tải thông báo');
        }

        const data = await response.json();
        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Không thể tải thông báo. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token, linkBackend]);

  const handleMarkAsRead = async (notificationId) => {
    if (!token) return;

    try {
      const response = await fetch(`${linkBackend}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Nếu là follow → sang trang profile người đó
    if (notification.notification_type === 'follow' && notification.actor_id) {
      navigate(`/profile/${notification.actor_id}`);
      return;
    }

    // Nếu có post_id (like, comment, ...) → nhảy về bài viết
if (notification.post_id) {
      // Dùng hash để giống NotificationBell, và để browser tự xử lý
      window.location.href = `/#post-${notification.post_id}`;
      return;
    }

    // Không có link cụ thể → giữ behavior cũ: expand / collapse
    setExpandedId(prev => (prev === notification.id ? null : notification.id));
  };

  // Group notifications
  const groupedNotifications = {
    Newest: [],
    Yesterday: [],
    Earlier: [],
  };

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifications.forEach(notification => {
    if (!notification.created_at) return;
    const notificationDate = new Date(notification.created_at);
    if (notificationDate.toDateString() === today.toDateString()) {
      groupedNotifications.Newest.push(notification);
    } else if (notificationDate.toDateString() === yesterday.toDateString()) {
      groupedNotifications.Yesterday.push(notification);
    } else {
      groupedNotifications.Earlier.push(notification);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="material-icons text-red-500 text-5xl">error_outline</span>
          </div>
          <p className="text-red-600 text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 hover:scale-110 transform"
                aria-label="Go back"
              >
                <span className="material-icons text-gray-600 text-2xl">arrow_back</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
<span className="material-icons text-blue-600">notifications_active</span>
                  Thông báo
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {notifications.filter(n => !n.is_read).length} thông báo chưa đọc
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Groups */}
        <div className="space-y-6">
          {Object.keys(groupedNotifications).map((groupName, groupIndex) => (
            groupedNotifications[groupName].length > 0 && (
              <div 
                key={groupName} 
                className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${groupIndex * 100}ms` }}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="material-icons text-lg">
                      {groupName === 'Newest' ? 'today' : groupName === 'Yesterday' ? 'yesterday' : 'calendar_month'}
                    </span>
                    {groupName === 'Newest' ? 'Mới nhất' : 
                     groupName === 'Yesterday' ? 'Hôm qua' : 
                     'Trước đó'}
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {groupedNotifications[groupName].map((notification, index) => (
                    <div 
                      key={notification.id} 
                      className={`transition-all duration-300 transform hover:scale-[1.02] ${
                        notification.is_read ? 'bg-white' : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div
                        className="p-5 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-4">
                          {notification.actor_avatar ? (
                            <div className="relative flex-shrink-0">
                              <img
                                src={getImageUrl(notification.actor_avatar, linkBackend)}
                                alt={notification.actor_username || 'User'}
                                className="w-14 h-14 rounded-full object-cover ring-4 ring-offset-2 ring-blue-200 transition-all duration-300 hover:ring-blue-400 hover:scale-110 shadow-lg"
                                onError={(e) => {
                                  e.target.onerror = null;
e.target.src = '/default-avatar.png';
                                }}
                              />
                              {!notification.is_read && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-lg ring-2 ring-white"></div>
                              )}
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-lg">
                              <span className="material-icons text-white text-3xl">person</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 text-base leading-relaxed">
                                  {notification.actor_username && (
                                    <Link 
                                      to={`/profile/${notification.actor_id}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200"
                                    >
                                      {notification.actor_username}
                                    </Link>
                                  )}{' '}
                                  <span className="text-gray-700">{notification.message}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                  <span className="material-icons text-xs">schedule</span>
                                  {formatTime(notification.created_at)}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1 animate-pulse shadow-lg"></div>
                              )}
                            </div>
                          </div>
                          <span 
                            className={`material-icons transition-transform duration-300 text-gray-400 flex-shrink-0 ${
                              expandedId === notification.id ? 'rotate-180 text-blue-500' : ''
                            }`}
                          >
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <div
className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedId === notification.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-5 pb-5 pt-0 border-t border-gray-100 bg-gray-50">
                          {notification.notification_type === 'follow' && (
                            <Link
                              to={`/profile/${notification.actor_id}`}
                              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors duration-200 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="material-icons text-lg">person</span>
                              Xem profile của {notification.actor_username}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
          
          {notifications.length === 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-in fade-in duration-500">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <span className="material-icons text-gray-400 text-6xl">notifications_none</span>
              </div>
              <p className="text-gray-500 text-lg font-medium">Chưa có thông báo nào</p>
              <p className="text-gray-400 text-sm mt-2">Các thông báo mới sẽ xuất hiện ở đây</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-top-2 {
          animation: slide-in-from-top 0.3s ease-out;
        }
        
        .slide-in-from-bottom-4 {
          animation: slide-in-from-bottom 0.5s ease-out;
        }
        
        .fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default NotificationPage;