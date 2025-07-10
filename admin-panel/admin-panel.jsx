"use client"

import { useState } from "react"
import Login from "./components/login"
import Navbar from "./components/navbar"
import TopHeader from "./components/top-header"
import UserOperations from "./pages/user-operations"
import GymOperations from "./pages/gym-operations"
import SettingsPage from "./pages/settings"

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [activeMenu, setActiveMenu] = useState("users")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setActiveMenu("users") // Reset menu
  }

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const renderContent = () => {
    switch (activeMenu) {
      case "users":
        return <UserOperations />
      case "gym":
        return <GymOperations />
      case "settings":
        return <SettingsPage />
      default:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Hoş Geldiniz</h1>
            <p className="text-gray-600">Lütfen sol menüden bir seçenek seçiniz.</p>
          </div>
        )
    }
  }

  // Login ekranını göster
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  // Admin panel'i göster
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Navbar activeMenu={activeMenu} setActiveMenu={setActiveMenu} sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <TopHeader onToggleSidebar={handleToggleSidebar} onLogout={handleLogout} />

        {/* Page Content */}
        <main className="flex-1 p-3 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  )
}
