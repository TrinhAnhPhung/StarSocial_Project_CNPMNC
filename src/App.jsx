import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout';
import Feed from './Components/Feed';
import Explore from './Components/Explore';
import People from './Components/People';
import Saved from './Components/Saved';
import CreatePost from './Components/CreatePost';
import Login from './Login/Login';
import Register from './Login/Register';
import Profile from './Components/Profile';
import SplashScreen from './Login/plashscreen'; // Import the SplashScreen component
import Editprofile from './Components/Editprofile';
import Notification from './Components/Notification'; // Import the Notification component
import AdminPage from './Admin/AdminPage'; // Import the AdminPage component
import ReportProcessorPage from './HandleReport/ReportProcessorDashboard'; // Import the ReportProcessorDashboard

const App = () => {
  return (
    <Routes>
      {/* Auth routes */}
      
      <Route path="/Login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/plashscreen" element={<SplashScreen />} />
      <Route path="/editprofile" element={<Editprofile />} />
      <Route path="/Notification" element={<Notification />} />


      <Route path="/admin" element={<AdminPage />} />
<Route path="/processor" element={<ReportProcessorPage />} />
      {/* App routes */}
      <Route element={<MainLayout />}>
     
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Feed />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/people" element={<People />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/create-post" element={<CreatePost />} />
       
      </Route>
    </Routes>
  );
};

export default App;
