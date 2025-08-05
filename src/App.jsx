import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layout & Main Components
import MainLayout from './MainLayout';
import Feed from './Components/Feed';
import Explore from './Components/Explore';
import People from './Components/People';
import Saved from './Components/Saved';
import CreatePost from './Components/CreatePost';
import Profile from './Components/Profile';
import Editprofile from './Components/Editprofile';
import Notification from './Components/notification';
import EditPostPage from './Components/EditPostPage';

// Auth Components
import Login from './Login/Login';
import Register from './Login/Register';
import SplashScreen from './Login/plashscreen';

// Admin & Report Handling Components
import AdminPage from './Admin/AdminPage';
import ReportProcessorPage from './HandleReport/ReportProcessorDashboard';
import Blockaccount from './HandleReport/Blockaccount';
import SensitiveKeywordStatistics from './HandleReport/Sensitivekey';
import ReportLayout from './HandleReport/ReportLayout';

const App = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/Login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/plashscreen" element={<SplashScreen />} />

      {/* Standalone pages */}
      <Route path="/editprofile" element={<Editprofile />} />
      <Route path="/Notification" element={<Notification />} />

      {/* Admin route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      {/* Report handler routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'handlereport']}>
            <ReportLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/processor" element={<ReportProcessorPage />} />
        <Route path="/blockaccount" element={<Blockaccount />} />
        <Route path="/keyword-statistics" element={<SensitiveKeywordStatistics />} />
      </Route>

      {/* App routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Feed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/people" element={<People />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/edit-post/:postId" element={<EditPostPage />} />
      </Route>
    </Routes>
  );
};

export default App;
