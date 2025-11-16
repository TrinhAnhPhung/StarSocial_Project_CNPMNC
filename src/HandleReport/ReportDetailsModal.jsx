import React from 'react';

// Component SafeAvatar (Không thay đổi)
const SafeAvatar = ({ src, alt, className }) => (
  <img 
    src={src} 
    alt={alt} 
    // THAY ĐỔI: Viền màu xám đậm
    className={`${className} h-10 w-10 rounded-full object-cover border border-slate-600`}
    onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=N+A&background=random'; }}
  />
);

// Component Modal (Phiên bản Dark Theme)
const ReportDetailsModal = ({ isOpen, onClose, details, loading }) => {
  if (!isOpen) return null;

  return (
    // Lớp nền mờ (backdrop)
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.30)] backdrop-blur-[1px] z-50 flex justify-center items-center p-4">
      
      {/* Khung nội dung Modal */}
      <div 
        className="
          bg-slate-900 shadow-xl rounded-lg w-full max-w-md md:max-w-xl 
          overflow-hidden 
          border border-slate-700
        "
        // THAY ĐỔI: `bg-white` -> `bg-slate-900`
        // SỬA LỖI: `border-black-200` (lỗi) -> `border-slate-700`
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-slate-800 text-white">
          {/* THAY ĐỔI: `bg-blue-900` -> `bg-slate-800` */}
          <h3 className="text-lg font-semibold">Chi tiết Báo cáo</h3>
          <button 
            onClick={onClose} 
            className="text-slate-300 hover:text-white text-2xl font-bold leading-none"
            aria-label="Đóng"
          >
            &times;
          </button>
        </div>

        {/* Nội dung */}
        <div className="max-h-[60vh] overflow-y-auto p-5 bg-slate-900">
          {/* THAY ĐỔI: `bg-blue-50` -> `bg-slate-900` */}
          {loading ? (
            <p className="text-slate-400 text-center py-4">Đang tải chi tiết...</p>
          ) : (
            <ul className="space-y-3"> 
              {details.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Không tìm thấy chi tiết báo cáo.</p>
              ) : (
                details.map((report, index) => (
                  // THAY ĐỔI: `bg-white` -> `bg-slate-800`
                  <li key={index} className="p-4 bg-slate-800 rounded-lg shadow-sm border border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <SafeAvatar 
                          src={report.Profile_Picture} 
                          alt={report.Email} 
                          className="h-10 w-10"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-blue-400 truncate">
                          {/* THAY ĐỔI: `text-indigo-800` -> `text-blue-400` */}
                          {report.Email}
                        </p>
                        <p className="text-sm text-slate-400">
                          {/* THAY ĐỔI: `text-gray-600` -> `text-slate-400` */}
                          {report.First_Name} {report.Last_name}
                        </p>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-sm text-yellow-300 bg-yellow-900/50 border border-yellow-800 p-3 rounded-md">
                      {/* THAY ĐỔI: Box lý do phiên bản Dark Theme */}
                      <strong className="font-semibold">Lý do:</strong> {report.Reason}
                    </p>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsModal;