import React from 'react'
import Sidebar from './Components/Sidebar'
import TopCreators from './Components/TopCreators'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="flex bg-white-900">
      <div className="sticky top-0 w-64 h-screen">
        <Sidebar />
      </div>

      <div className="flex-1 p-4">
        <Outlet />
      </div>

      <div className="sticky top-0 w-1/4 bg-white-800 p-4 text-white h-screen overflow-auto">
        <TopCreators />
      </div>
    </div>
  )
}

export default MainLayout
