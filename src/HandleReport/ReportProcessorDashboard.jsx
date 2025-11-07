// src/HandleReport/ReportProcessorDashboard.jsx
import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
import { API_BASE, safeJson } from '../constants/api';
import SafeAvatar from '../Components/SafeAvatar'; // đổi path nếu bạn để chỗ khác

/* ------------------------------ Helpers ------------------------------ */

// Ảnh FB/CDN hay bị 403; base64 bị cắt "..." là URL hỏng
const isTruncatedDataUrl = (s = '') => s.startsWith('data:image') && s.includes('...');
const isBlockedHost = (s = '') => /facebook|fbcdn|scontent/i.test(s);
const normalizeImage = (s) => (!s || isTruncatedDataUrl(s) || isBlockedHost(s) ? null : s);

// Đếm số lần vi phạm trong 7 ngày
const countViolationsInLast7Days = (dates) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  return (dates || []).filter((d) => {
    const t = new Date(d);
    return t >= sevenDaysAgo && t <= now;
  }).length;
};

// fetch wrapper: tự xử lý 401 → xóa token + điều hướng /login
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (res.status === 403) {
    // bị khóa hoặc không đủ quyền
    alert('Bạn không có quyền hoặc tài khoản đang bị khóa.');
    throw new Error('Forbidden');
  }
  return res;
}

async function resolveUserIdByEmail(email) {
  const res = await apiFetch(`/api/auth/users/by-email?email=${encodeURIComponent(email)}`);
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Không tìm thấy user theo email');
  return data.id;
}

async function markViolationAPI(payload) {
  const res = await apiFetch('/api/reports/mark-violation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Mark violation failed');
  return data;
}

// ✅ NEW: API mở khóa tài khoản
async function unlockUserAPI(targetUserId) {
  const res = await apiFetch('/api/reports/unlock-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUserId }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Unlock failed');
  return data;
}

/* ----------------------------- Mock data ---------------------------- */

const initialReports = [
  {
    email: 'trinhA@gmail.com',
    image:
      'https://scontent.fhan4-1.fna.fbcdn.net/v/t39.30808-6/500094991_1919571285248039_5357285522866728383_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=hIjWT9QxP8UQ7kNvwGFIT8j&_nc_oc=AdkZgNiOJyOu6IlJadcLVJM3nAeXLLZCIgjnCWyRr6h3ocZenxSmTkWSnlV2BuXHbMI&_nc_zt=23&_nc_ht=scontent.fhan4-1.fna&_nc_gid=R7H5yiW3WZcKloUs_QtEYA&oh=00_AfUAN_FyHvjmVfeTqjmEESUf5x4g5DzOKPmNFI2iaaYXbA&oe=68976A04',
    date: '7 thg 4, 2020',
    link: 'http://localhost:5173',
    description:
      'Nội dung đăng tải có chứa ngôn ngữ thù địch và phân biệt đối xử với một nhóm người cụ thể. Bài viết cần được gỡ bỏ.',
    violations: 0,
    violationDates: [],
  },
  {
    email: 'ollyben@gmail.com',
    image:
      'https://scontent.fhan4-6.fna.fbcdn.net/v/t39.30808-1/507553099_1098345012328975_6140855432282303951_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=108&ccb=1-7&_nc_sid=e99d92&_nc_ohc=k3QlJJ4aqawQ7kNvwGNlSNm&_nc_oc=AdnNTHWDMTJpcNunqpFYuthlcFQexDlgJcga8zB9C9iG1XxtIEq1-dQubDkEk1tru-8&_nc_zt=24&_nc_ht=scontent.fhan4-6.fna&_nc_gid=vxEzadMbC8T8Z0nrn4_MwA&oh=00_AfXDETrUcO8dPPU41WNLesEvrZLefHjzP9AMxcXVwfE3sw&oe=68976C65',
    date: '16 thg 4, 2020',
    link: 'http://localhost:5173',
    description:
      'Bài viết quảng cáo sản phẩm thuốc lá điện tử, vi phạm chính sách về nội dung bị cấm. Cần xem xét xóa bài viết.',
    violations: 0,
    violationDates: [],
  },
  {
    email: 'sarah.jones@yahoo.com',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    date: '20 thg 5, 2020',
    link: 'http://localhost:5173',
    description:
      'Tài khoản đăng tải hình ảnh nhạy cảm, vi phạm tiêu chuẩn cộng đồng về nội dung người lớn. Cần cảnh cáo và gỡ bỏ hình ảnh.',
    violations: 0,
    violationDates: [],
  },
  {
    email: 'peter.nguyen@outlook.com',
    image: null, // cố tình để null để thấy fallback
    date: '10 thg 6, 2020',
    link: 'http://localhost:5173',
    description:
      'Video chia sẻ thông tin sai lệch về một sự kiện y tế, gây hoang mang dư luận. Cần gỡ bỏ video và dán nhãn cảnh báo.',
    violations: 0,
    violationDates: [],
  },
];

/* ------------------------------- UI ------------------------------- */

const ReportTable = () => {
  const [reports, setReports] = useState(initialReports);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [busyIndex, setBusyIndex] = useState(null);

  const handleMarkViolation = async (index) => {
    try {
      setBusyIndex(index);
      const actorId = JSON.parse(localStorage.getItem('user'))?.id;
      const token = localStorage.getItem('token');
      if (!actorId || !token) throw new Error('Chưa đăng nhập.');

      // 1) map email -> userId
      const targetUserId = await resolveUserIdByEmail(reports[index].email);

      // 2) call API
      const result = await markViolationAPI({
        targetUserId,
        postId: null,
        reason:
          reports[index].description?.slice(0, 200) || 'Vi phạm tiêu chuẩn cộng đồng',
      });

      // 3) update UI
      const nowISO = new Date().toISOString();
      setReports((prev) => {
        const next = [...prev];
        const r = { ...next[index] };
        r.violations = (r.violations || 0) + 1;
        r.violationDates = Array.isArray(r.violationDates)
          ? [...r.violationDates, nowISO]
          : [nowISO];
        next[index] = r;
        return next;
      });

      setOpenDropdown(null);

      if (result.locked || result.violation_count >= 3) {
        alert(
          `Tài khoản ${reports[index].email} đã bị khóa do vi phạm ${result.violation_count} lần.`
        );
      } else {
        alert(`Đã đánh dấu vi phạm. Tổng vi phạm: ${result.violation_count}`);
      }
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setBusyIndex(null);
    }
  };

  // ✅ NEW: mở khóa tài khoản
  const handleUnlock = async (index) => {
    try {
      setBusyIndex(index);
      const email = reports[index].email;
      const targetUserId = await resolveUserIdByEmail(email);
      await unlockUserAPI(targetUserId);
      setOpenDropdown(null);
      alert(`Đã mở khóa tài khoản ${email}.`);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Mở khóa thất bại');
    } finally {
      setBusyIndex(null);
    }
  };

  const handleToggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm">
        <thead className="text-gray-600 text-left bg-gray-50">
          <tr>
            <th className="p-4 font-medium">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="p-4 font-medium">Email</th>
            <th className="p-4 font-medium">Image</th>
            <th className="p-4 font-medium">Date sent</th>
            <th className="p-4 font-medium">Link account</th>
            <th className="p-4 font-medium">Mô tả</th>
            <th className="p-4 font-medium">Violations</th>
            <th className="p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => {
            const last7 = countViolationsInLast7Days(report.violationDates);
            return (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="p-4 font-medium text-gray-900">{report.email}</td>
                <td className="p-4">
                  <SafeAvatar
                    src={normalizeImage(report.image) || '/default-avatar.png'}
                    alt={`Avatar ${report.email}`}
                    size={40}
                    className="h-10 w-10"
                  />
                </td>
                <td className="p-4 text-gray-600">{report.date}</td>
                <td className="p-4">
                  <a
                    href={report.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {report.link}
                  </a>
                </td>
                <td className="p-4 text-gray-600 max-w-xs">{report.description}</td>
                <td className="p-4">
                  <div className="flex flex-col items-start gap-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        report.violations > 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      Tổng: {report.violations}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      7 ngày gần đây: {last7}
                    </span>
                  </div>
                </td>
                <td className="p-4 relative">
                  <div className="flex gap-3 items-center">
                    <button className="text-gray-500 hover:text-blue-600">
                      <FiEdit size={18} />
                    </button>
                    <button className="text-gray-500 hover:text-red-600">
                      <FiTrash2 size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleDropdown(index)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <FiMoreHorizontal size={18} />
                    </button>
                  </div>
                  {openDropdown === index && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <ul className="py-1">
                        <li>
                          <button
                            onClick={() => handleMarkViolation(index)}
                            disabled={busyIndex === index}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                          >
                            {busyIndex === index
                              ? 'Đang xử lý...'
                              : `Đánh dấu vi phạm (${report.violations} / 3)`}
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => alert(`Đã cấm tài khoản ${report.email}.`)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            Cấm tài khoản
                          </button>
                        </li>

                        {/* ✅ NEW: Mở khóa tài khoản */}
                        <li>
                          <button
                            onClick={() => handleUnlock(index)}
                            disabled={busyIndex === index}
                            className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100 disabled:opacity-60"
                          >
                            {busyIndex === index ? 'Đang mở khóa...' : 'Mở khóa tài khoản'}
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ReportProcessorDashboard = () => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <ReportTable />
  </div>
);

export default ReportProcessorDashboard;
