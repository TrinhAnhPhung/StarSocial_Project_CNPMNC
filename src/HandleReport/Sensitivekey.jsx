import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

// Thêm các hằng số để gọi API
const getToken = () => localStorage.getItem('token');
const API_URL = 'http://localhost:5000/api/handle';

/* ------------------------------- Modals ------------------------------- */

/**
 * Modal Xác nhận Xóa Từ khóa
 * (Thay thế window.confirm)
 */
const DeleteKeywordModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.30)] backdrop-blur-[1px] z-50 flex justify-center items-center p-4">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-sm border border-slate-700">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:mx-0">
              <FiAlertTriangle className="h-6 w-6 text-red-300" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Xóa từ khóa</h3>
              <p className="mt-1 text-sm text-slate-400">
                Bạn có chắc chắn muốn xóa từ khóa này không?
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
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Đang xóa...' : 'Xác nhận Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal Thêm Từ khóa Mới
 * (Thay thế form inline)
 */
const AddKeywordModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [newKeyword, setNewKeyword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (newKeyword.trim() === '') {
      alert('Vui lòng nhập từ khóa.'); // Tạm thời dùng alert cho validation
      return;
    }
    onConfirm(newKeyword);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.30)] backdrop-blur-[1px] z-50 flex justify-center items-center p-4">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-sm border border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-100">Thêm từ khóa mới</h3>
          <p className="mt-1 text-sm text-slate-400">
            Nhập từ khóa nhạy cảm bạn muốn thêm vào hệ thống.
          </p>
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="w-full mt-4 p-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-100 placeholder-slate-400"
            placeholder="Nhập từ khóa..."
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
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang thêm...' : 'Thêm từ khóa'}
          </button>
        </div>
      </div>
    </div>
  );
};


/* ------------------------------- Keyword Table ------------------------------- */
const KeywordTable = ({ keywords, onDeleteClick }) => { // Đổi tên prop
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-slate-900 text-sm">
        {/* THAY ĐỔI: Đồng bộ theme Bảng */}
        <thead className="bg-slate-800">
          <tr>
            {/* XÓA: Checkbox th */}
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Keyword</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Date</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {keywords.map((item) => (
            <tr key={item.Keyword_id} className="hover:bg-slate-800/60 transition-colors duration-150">
              {/* XÓA: Checkbox td */}
              <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-100">{item.Keyword}</td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                {new Date(item.Added_At).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowKrap flex items-center gap-2">
                {/* ĐÃ XÓA NÚT CHỈNH SỬA */}
                <button 
                  onClick={() => onDeleteClick(item.Keyword_id)} // Gọi hàm mới
                  className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-slate-700 transition-colors duration-150"
                >
                  <FiTrash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ------------------------------- Main Component ------------------------------- */
const Sensitivekey = () => {
  // State cho danh sách, loading, và lỗi
  const [keywordsList, setKeywordsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  // State cho Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKeywordId, setSelectedKeywordId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm để tải danh sách từ khóa từ API
  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error('Không tìm thấy token');

      const response = await fetch(`${API_URL}/keywords`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách từ khóa');
      }
      
      const data = await response.json();
      setKeywordsList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dùng useEffect để gọi API khi component được tải
  useEffect(() => {
    fetchKeywords();
  }, []); // Mảng rỗng [] nghĩa là chỉ chạy 1 lần

  // Hàm xử lý khi nhấn nút "Add Keyword"
  const submitAddKeyword = async (newKeyword) => {
    if (newKeyword.trim() === '') return;

    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ keyword: newKeyword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Thêm từ khóa thất bại');
      }
      
      // Tải lại danh sách thay vì alert
      fetchKeywords(); 
    } catch (err) {
      console.error(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setIsAddModalOpen(false);
    }
  };

  // Hàm mở modal Xóa
  const handleDeleteClick = (keywordId) => {
    setSelectedKeywordId(keywordId);
    setIsDeleteModalOpen(true);
  };

  // Hàm xử lý khi nhấn nút "Xóa"
  const submitDeleteKeyword = async () => {
    if (!selectedKeywordId) return;

    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/keywords/${selectedKeywordId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Xóa thất bại');
      }

      // Xóa từ khóa khỏi state để giao diện tự cập nhật
      setKeywordsList(prevList => 
        prevList.filter(kw => kw.Keyword_id !== selectedKeywordId)
      );
    } catch (err) {
      console.error(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
      setSelectedKeywordId(null);
    }
  };

  // Lọc danh sách từ khóa dựa trên ô tìm kiếm
  const filteredKeywords = useMemo(() => {
    return keywordsList.filter(kw => 
      kw.Keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [keywordsList, searchTerm]);

  return (
    <>
      {/* THAY ĐỔI: Đồng bộ theme toàn trang */}
      <div className="p-4 md:p-6 bg-slate-800 min-h-full w-full">
        <h1 className="text-3xl font-extrabold text-slate-100 mb-6">Sensitive Keywords</h1>
        <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700">
          {/* THAY ĐỔI: Thanh header mới (Search và Add) */}
          <div 
            className="p-5 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            {/* Ô tìm kiếm */}
            <div className="relative flex-grow w-full md:max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-100 placeholder-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Nút thêm từ khóa mới (mở Modal) */}
            <button 
              type="button" 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-shrink-0 w-full md:w-auto flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-md"
            >
              <FiPlus className="mr-2" />
              Add Keyword
            </button>
          </div>
          
          {/* Hiển thị Bảng, Loading, hoặc Lỗi */}
          {loading && <div className="p-5 text-center text-slate-300">Đang tải danh sách từ khóa...</div>}
          {error && <div className="p-5 text-center text-red-400">Lỗi: {error}</div>}
          {!loading && !error && (
            <KeywordTable 
              keywords={filteredKeywords} 
              onDeleteClick={handleDeleteClick} // Truyền hàm mở modal
            />
          )}
        </div>
      </div>
      
      {/* Render các Modals */}
      <AddKeywordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={submitAddKeyword}
        loading={isSubmitting}
      />
      <DeleteKeywordModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={submitDeleteKeyword}
        loading={isSubmitting}
      />
    </>
  );
};

export default Sensitivekey;