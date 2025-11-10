import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const NotificationBell = ({ isCollapsed = false }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const linkBackend = import.meta.env.VITE_Link_backend || 'http://localhost:5000';

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${linkBackend}/api/notifications/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token || loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${linkBackend}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when dropdown opens
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      fetchNotifications();
    }
  }, [isOpen, isLoggedIn]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoggedIn, isOpen]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when dropdown is open on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${linkBackend}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const secondsPast = (now - date) / 1000;

    if (secondsPast < 60) return `${Math.round(secondsPast)}s`;
    if (secondsPast < 3600) return `${Math.round(secondsPast / 60)}m`;
    if (secondsPast < 86400) return `${Math.round(secondsPast / 3600)}h`;
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${month} ${day}`;
  };

  if (!isLoggedIn) return null;

  // Render for collapsed sidebar (icon only)
  if (isCollapsed) {
    return (
      <div className="relative w-full flex items-center justify-center" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`relative ${isMobile ? 'p-2' : 'p-3'} rounded-xl transition-all duration-300 hover:scale-110 hover:bg-gray-100 active:scale-95 flex items-center justify-center`}
          title="Thông báo"
        >
          <span className="material-icons text-2xl transition-transform duration-300 hover:rotate-12" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            notifications
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg transform hover:scale-110 transition-transform">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <>
            {/* Mobile overlay backdrop */}
            {isMobile && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
                onClick={() => setIsOpen(false)}
              />
            )}
            <div className={`${isMobile 
              ? 'fixed bottom-16 left-2 right-2 w-auto max-w-none' 
              : 'absolute left-full ml-2 top-0 w-80'} bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden flex flex-col animate-in slide-in-from-top-2 duration-300`}
              style={isMobile ? { maxHeight: 'calc(100vh - 8rem)' } : { maxHeight: '24rem' }}
            >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="material-icons text-blue-600">notifications</span>
                Thông báo
              </h3>
              <Link 
                to="/notification" 
                onClick={() => setIsOpen(false)}
                className="text-blue-500 text-sm hover:underline font-medium transition-colors hover:text-blue-600"
              >
                Xem tất cả
              </Link>
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="text-gray-500 mt-2">Đang tải...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="material-icons text-gray-400 text-4xl">notifications_none</span>
                  </div>
                  <p className="text-gray-500">Không có thông báo nào</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.slice(0, 10).map((notification, index) => (
                    <Link
                      key={notification.id}
                      to={notification.notification_type === 'follow' 
                        ? `/profile/${notification.actor_id}`
                        : notification.post_id 
                        ? `/#post-${notification.post_id}`
                        : '/notification'
                      }
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                        setIsOpen(false);
                      }}
                      className={`block p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 transform hover:translate-x-1 ${
                        notification.is_read ? 'bg-white' : 'bg-blue-50/50'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        {notification.actor_avatar ? (
                          <div className="relative flex-shrink-0">
                            <img
                              src={getImageUrl(notification.actor_avatar, linkBackend)}
                              alt={notification.actor_username || 'User'}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ring-blue-200 transition-all duration-300 hover:ring-blue-400 hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                            {!notification.is_read && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="material-icons text-white text-xl">person</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {notification.actor_username && (
                              <span className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                {notification.actor_username}
                              </span>
                            )}{' '}
                            <span className="text-gray-700">{notification.message}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                            <span className="material-icons text-xs">schedule</span>
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2 animate-pulse shadow-lg"></div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Render for expanded sidebar (full width with text)
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          flex items-center space-x-4 p-3 rounded-xl font-semibold w-full
          transition-all duration-300 ease-in-out transform
          ${isOpen 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' 
            : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:scale-105 hover:shadow-md'
          }
        `}
        title="Thông báo"
      >
        <div className="relative">
          <span className={`material-icons text-2xl transition-transform duration-300 ${isOpen ? 'animate-bounce' : 'hover:rotate-12'}`}>
            notifications
          </span>
          {unreadCount > 0 && (
            <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg transform transition-all duration-300 ${isOpen ? 'animate-pulse scale-110' : 'hover:scale-110'}`}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="transition-colors duration-300">Notifications</span>
      </button>

      {isOpen && (
        <>
          {/* Mobile overlay backdrop */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
              onClick={() => setIsOpen(false)}
            />
          )}
          <div className={`${isMobile 
            ? 'fixed bottom-16 left-2 right-2 w-auto max-w-none' 
            : 'absolute left-0 mt-2 w-80'} bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden flex flex-col animate-in slide-in-from-top-2 duration-300`}
            style={isMobile ? { maxHeight: 'calc(100vh - 8rem)' } : { maxHeight: '24rem' }}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="material-icons text-blue-600">notifications</span>
                Thông báo
              </h3>
              <Link 
                to="/notification" 
                onClick={() => setIsOpen(false)}
                className="text-blue-500 text-sm hover:underline font-medium transition-colors hover:text-blue-600"
              >
                Xem tất cả
              </Link>
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="text-gray-500 mt-2">Đang tải...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="material-icons text-gray-400 text-4xl">notifications_none</span>
                  </div>
                  <p className="text-gray-500">Không có thông báo nào</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.slice(0, 10).map((notification, index) => (
                    <Link
                      key={notification.id}
                      to={notification.notification_type === 'follow' 
                        ? `/profile/${notification.actor_id}`
                        : notification.post_id 
                        ? `/#post-${notification.post_id}`
                        : '/notification'
                      }
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                        setIsOpen(false);
                      }}
                      className={`block p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 transform hover:translate-x-1 ${
                        notification.is_read ? 'bg-white' : 'bg-blue-50/50'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        {notification.actor_avatar ? (
                          <div className="relative flex-shrink-0">
                            <img
                              src={getImageUrl(notification.actor_avatar, linkBackend)}
                              alt={notification.actor_username || 'User'}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ring-blue-200 transition-all duration-300 hover:ring-blue-400 hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                            {!notification.is_read && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="material-icons text-white text-xl">person</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {notification.actor_username && (
                              <span className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                {notification.actor_username}
                              </span>
                            )}{' '}
                            <span className="text-gray-700">{notification.message}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                            <span className="material-icons text-xs">schedule</span>
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2 animate-pulse shadow-lg"></div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
