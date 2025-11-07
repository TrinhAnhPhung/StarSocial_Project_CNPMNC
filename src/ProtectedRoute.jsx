import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/Login" replace />;
  }

  const user = JSON.parse(userStr);
  const userRole = user?.role?.toLowerCase().trim();

  // Normalize allowedRoles để so sánh (chuyển sang lowercase)
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().trim());
  
  // Xử lý trường hợp role có thể là "handlereport" hoặc "handle report"
  const isAllowed = normalizedAllowedRoles.some(allowedRole => {
    if (allowedRole === 'handlereport') {
      return userRole === 'handlereport' || userRole === 'handle report';
    }
    return userRole === allowedRole;
  });

  if (!isAllowed) {
    console.log(`⚠️  User role "${userRole}" không có quyền truy cập. Allowed roles:`, normalizedAllowedRoles);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
