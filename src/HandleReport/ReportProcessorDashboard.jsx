import React, { useState, useEffect } from 'react';
import { FiTrash2, FiEye, FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Import file Modal
import ReportDetailsModal from './ReportDetailsModal';

/* ------------------------------ Helpers ------------------------------ */
// THAY ĐỔI: Đồng bộ viền avatar
const SafeAvatar = ({ src, alt, className }) => (
  <img 
    src={src} 
    alt={alt} 
    className={`${className} h-10 w-10 rounded-full object-cover border border-slate-700`}
    onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=N+A&background=random'; }}
  />
);

const getToken = () => localStorage.getItem('token');
const API_URL = 'http://localhost:5000/api/handle';

/* ------------------------------- Modals ------------------------------- */

/**
 * Modal Xác nhận Bỏ qua (Dismiss)
 * (Thay thế window.confirm)
 */
const DismissModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.30)] backdrop-blur-[1px] z-50 flex justify-center items-center p-4">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-sm border border-slate-700">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-900/50 sm:mx-0">
              <FiAlertTriangle className="h-6 w-6 text-yellow-300" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Bỏ qua báo cáo</h3>
              <p className="mt-1 text-sm text-slate-400">
                Bạn có chắc muốn bỏ qua tất cả báo cáo cho bài viết này?
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 bg-slate-800 p-4 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal Nhập lý do Ban
 * (Thay thế window.prompt)
 */
const BanModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reason.trim() === '') {
      alert('Vui lòng nhập lý do khóa bài viết.'); 
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.30)] backdrop-blur-[1px] z-50 flex justify-center items-center p-4">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-sm border border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-100">Khóa bài viết</h3>
          <p className="mt-1 text-sm text-slate-400">
            Vui lòng nhập lý do khóa bài viết này.
          </p>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full mt-4 p-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-100 placeholder-slate-400"
            placeholder="Nhập lý do..."
          />
        </div>
        <div className="flex justify-end space-x-3 bg-slate-800 p-4 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Đang khóa...' : 'Khóa bài viết'}
          </button>
        </div>
      </div>
    </div>
  );
};


/* ------------------------------- Report Table ------------------------------- */
const ReportTable = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentReportDetails, setCurrentReportDetails] = useState([]);

  // State cho Modal Ban/Dismiss
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Dùng chung cho cả 2 modal
  
  // (useEffect fetchReports không thay đổi)
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) throw new Error('Chưa đăng nhập hoặc không có token.');
        
        const response = await fetch(`${API_URL}/pending-reports`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Không thể tải báo cáo. Bạn có quyền truy cập không?');
        
        const data = await response.json();
        setReports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // THAY ĐỔI: Hàm này được gọi bởi BanModal
  const submitBanPost = async (reason) => {
    if (!selectedPostId) return;

    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/ban-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ postId: selectedPostId, reason }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Khóa bài viết thất bại');
      }
      setReports(prevReports => prevReports.filter(report => report.Post_id !== selectedPostId));
    } catch (err) {
      console.error(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setIsBanModalOpen(false);
      setSelectedPostId(null);
    }
  };

  // THAY ĐỔI: Hàm này được gọi bởi DismissModal
  const submitDismissReports = async () => {
    if (!selectedPostId) return;

    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dismiss-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ postId: selectedPostId }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Bỏ qua báo cáo thất bại');
      }
      setReports(prevReports => prevReports.filter(report => report.Post_id !== selectedPostId));
    } catch (err) {
      console.error(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setIsDismissModalOpen(false);
      setSelectedPostId(null);
    }
  };

  // Hàm mở modal Ban
  const handleBanClick = (postId) => {
    setSelectedPostId(postId);
    setIsBanModalOpen(true);
  };
  
  // Hàm mở modal Dismiss
  const handleDismissClick = (postId) => {
    setSelectedPostId(postId);
    setIsDismissModalOpen(true);
  };

  // (handleViewReports không thay đổi logic, chỉ xóa alert)
  const handleViewReports = async (postId) => {
    if (isModalOpen) return; 
    setIsModalOpen(true);
    setModalLoading(true);
    setCurrentReportDetails([]); 

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/reports/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Không thể tải chi tiết báo cáo');
      
      const data = await response.json();
      setCurrentReportDetails(data);
    } catch (err) {
      console.error(err.message);
      setIsModalOpen(false); 
    } finally {
      setModalLoading(false);
    }
  };


  // THAY ĐỔI: Màu chữ Loading/Error/Empty
  if (loading) return <div className="p-5 text-center text-slate-300">Đang tải các báo cáo...</div>;
  if (error) return <div className="p-5 text-center text-red-400">Lỗi: {error}</div>;
  if (reports.length === 0) return <div className="p-5 text-center text-slate-400">Không có bài viết nào đang chờ xử lý.</div>;

  return (
    <> 
      <div className="overflow-x-auto">
        <table className="min-w-full bg-slate-900 text-sm">
          {/* THAY ĐỔI: Đồng bộ màu thead */}
          <thead className="bg-slate-800">
            <tr>
              {/* XÓA: Checkbox th */}
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date Sent</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Link</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Reports</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          {/* THAY ĐỔI: Đồng bộ màu tbody */}
          <tbody className="divide-y divide-slate-700">
            {reports.map((report) => {
              const isBusy = isSubmitting && selectedPostId === report.Post_id;
              
              return (
                <tr 
                  key={report.Post_id} 
                  // THAY ĐỔI: Đồng bộ màu tr
                  className="hover:bg-slate-800/60 transition-colors duration-150 cursor-pointer"
                  onDoubleClick={() => handleViewReports(report.Post_id)}
                >
                  {/* XÓA: Checkbox td */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <SafeAvatar src={report.Profile_Picture} alt={`Avatar ${report.Email}`} className="h-10 w-10" />
                      <div className="ml-3">
                        {/* THAY ĐỔI: Đồng bộ màu text */}
                        <div className="font-medium text-slate-100">{report.Email}</div>
                        <div className="text-xs text-slate-400">{report.First_Name} {report.Last_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{new Date(report.Created_At).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/post/${report.Post_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      // THAY ĐỔI: Đồng bộ màu link
                      className="text-blue-400 hover:underline hover:text-blue-300 transition-colors"
                      onClick={(e) => e.stopPropagation()} 
                    >
                      View Post
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-300 max-w-xs break-words">{report.Content}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReports(report.Post_id);
                      }}
                      // THAY ĐỔI: Đồng bộ màu nút Reports
                      className="flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-900/50 text-yellow-300 hover:bg-yellow-800/50 transition-colors"
                    >
                      <FiEye className="mr-1" />
                      {report.QualityReporter} Reports
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right relative">
                    <div 
                      className="flex gap-2 justify-end items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={() => handleDismissClick(report.Post_id)}
                        disabled={isBusy}
                        // THAY ĐỔI: Đồng bộ màu nút Dismiss
                        className="text-slate-400 hover:text-blue-400 p-2 rounded-full hover:bg-slate-700 disabled:opacity-50 transition-colors duration-150"
                        title="Bỏ qua báo cáo"
                      >
                        {isBusy && isDismissModalOpen ? (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiTrash2 size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleBanClick(report.Post_id)}
                        disabled={isBusy}
                        // THAY ĐỔI: Đồng bộ màu nút Ban
                        className="text-xs font-semibold text-red-400 bg-red-900/50 px-3 py-1.5 rounded-full hover:bg-red-800/50 disabled:opacity-50 transition-colors duration-150"
                        title="Khóa bài viết này"
                      >
                        {isBusy && isBanModalOpen ? 'Đang xử lý...' : 'Ban'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal xem chi tiết (đã được đồng bộ) */}
      <ReportDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        details={currentReportDetails}
        loading={modalLoading}
      />
      
      {/* CÁC MODAL MỚI (thay thế confirm/prompt) */}
      <DismissModal 
        isOpen={isDismissModalOpen}
        onClose={() => setIsDismissModalOpen(false)}
        onConfirm={submitDismissReports}
        loading={isSubmitting}
      />
      
      <BanModal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        onConfirm={submitBanPost}
        loading={isSubmitting}
      />
    </>
  );
};

// Component chính
const ReportProcessorDashboard = () => (
  // THAY ĐỔI: Đồng bộ component cha
  <div className="p-4 md:p-6 bg-slate-800 min-h-full w-full">
    <h1 className="text-3xl font-extrabold text-slate-100 mb-6">Violating Posts</h1>
    <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700">
      <ReportTable />
    </div>
  </div>
);

export default ReportProcessorDashboard;