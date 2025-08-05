import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';

const initialReports = [
  {
    email: 'trinhA@gmail.com',
    image: 'https://scontent.fhan4-1.fna.fbcdn.net/v/t39.30808-6/500094991_1919571285248039_5357285522866728383_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=hIjWT9QxP8UQ7kNvwGFIT8j&_nc_oc=AdkZgNiOJyOu6IlJadcLVJM3nAeXLLZCIgjnCWyRr6h3ocZenxSmTkWSnlV2BuXHbMI&_nc_zt=23&_nc_ht=scontent.fhan4-1.fna&_nc_gid=R7H5yiW3WZcKloUs_QtEYA&oh=00_AfUAN_FyHvjmVfeTqjmEESUf5x4g5DzOKPmNFI2iaaYXbA&oe=68976A04',
    date: '7 thg 4, 2020',
    link: 'http://localhost:5173',
    description: 'Nội dung đăng tải có chứa ngôn ngữ thù địch và phân biệt đối xử với một nhóm người cụ thể. Bài viết cần được gỡ bỏ.',
  violations: 0
  },
  {
    email: 'ollyben@gmail.com',
    image: 'https://scontent.fhan4-6.fna.fbcdn.net/v/t39.30808-1/507553099_1098345012328975_6140855432282303951_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=108&ccb=1-7&_nc_sid=e99d92&_nc_ohc=k3QlJJ4aqawQ7kNvwGNlSNm&_nc_oc=AdnNTHWDMTJpcNunqpFYuthlcFQexDlgJcga8zB9C9iG1XxtIEq1-dQubDkEk1tru-8&_nc_zt=24&_nc_ht=scontent.fhan4-6.fna&_nc_gid=vxEzadMbC8T8Z0nrn4_MwA&oh=00_AfXDETrUcO8dPPU41WNLesEvrZLefHjzP9AMxcXVwfE3sw&oe=68976C65',
    date: '16 thg 4, 2020',
    link: 'http://localhost:5173',
    description: 'Bài viết quảng cáo sản phẩm thuốc lá điện tử, vi phạm chính sách về nội dung bị cấm. Cần xem xét xóa bài viết.',
  violations: 0
  },
  {
    email: 'sarah.jones@yahoo.com',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    date: '20 thg 5, 2020',
    link: 'http://localhost:5173',
    description: 'Tài khoản đăng tải hình ảnh nhạy cảm, vi phạm tiêu chuẩn cộng đồng về nội dung người lớn. Cần cảnh cáo và gỡ bỏ hình ảnh.',
  violations: 0
  },
  {
    email: 'peter.nguyen@outlook.com',
    image: 'data:image/jpeg;base64,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',
    date: '10 thg 6, 2020',
    link: 'http://localhost:5173',
    description: 'Video chia sẻ thông tin sai lệch về một sự kiện y tế, gây hoang mang dư luận. Cần gỡ bỏ video và dán nhãn cảnh báo.',
  violations: 0
  },
  {
    email: 'emily.white@gmail.com',
    image: 'data:image/jpeg;base64,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',
    date: '15 thg 7, 2020',
    link: 'http://localhost:5173',
    description: 'Kênh sử dụng bản quyền âm nhạc mà không có sự cho phép. Cần gỡ bỏ video hoặc yêu cầu chỉnh sửa.',
  violations: 0
  },
  {
    email: 'sarah.jones@yahoo.com',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    date: '20 thg 5, 2020',
    link: 'https://www.instagram.com/sarah_jones_art',
    description: 'Tài khoản đăng tải hình ảnh nhạy cảm, vi phạm tiêu chuẩn cộng đồng về nội dung người lớn. Cần cảnh cáo và gỡ bỏ hình ảnh.',
    violations: 0,
  },
];

const ReportTable = () => {
  const [reports, setReports] = useState(initialReports);
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleMarkViolation = (index) => {
    const newReports = [...reports];
    newReports[index].violations += 1;
    setReports(newReports);
    setOpenDropdown(null);
    if (newReports[index].violations >= 3) {
      alert(`Tài khoản ${newReports[index].email} đã bị cấm do vi phạm 3 lần.`);
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
            <th className="p-4 font-medium"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></th>
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
          {reports.map((report, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
              <td className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></td>
              <td className="p-4 font-medium text-gray-900">{report.email}</td>
              <td className="p-4">
                <img src={report.image} alt="report visual" className="h-10 w-10 rounded-full object-cover" />
              </td>
              <td className="p-4 text-gray-600">{report.date}</td>
              <td className="p-4">
                <a href={report.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {report.link}
                </a>
              </td>
              <td className="p-4 text-gray-600 max-w-xs">{report.description}</td>
              <td className="p-4 text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${report.violations > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {report.violations}
                </span>
              </td>
              <td className="p-4 relative">
                <div className="flex gap-3 items-center">
                  <button className="text-gray-500 hover:text-blue-600"><FiEdit size={18} /></button>
                  <button className="text-gray-500 hover:text-red-600"><FiTrash2 size={18} /></button>
                  <button onClick={() => handleToggleDropdown(index)} className="text-gray-500 hover:text-gray-800"><FiMoreHorizontal size={18} /></button>
                </div>
                {openDropdown === index && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <ul className="py-1">
                      <li>
                        <button onClick={() => handleMarkViolation(index)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Đánh dấu vi phạm ({report.violations} / 3)
                        </button>
                      </li>
                      <li>
                        <button onClick={() => alert(`Đã cấm tài khoản ${report.email}.`)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                          Cấm tài khoản
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReportProcessorDashboard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <ReportTable />
    </div>
  );
};

export default ReportProcessorDashboard;