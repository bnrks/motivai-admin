"use client"

import { Users, Dumbbell, Settings } from "lucide-react"

export default function Navbar({ activeMenu, setActiveMenu, sidebarCollapsed }) {
  const menuItems = [
    { id: "users", label: "Kullanıcı İşlemleri", icon: Users },
    { id: "gym", label: "Gym İşlemleri", icon: Dumbbell },
    { id: "settings", label: "Ayarlar", icon: Settings },
  ]

  return (
    <div className={`bg-slate-800 text-white transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
      {/* Logo/Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          {!sidebarCollapsed && (
            <div>
              <h2 className="font-bold text-lg">Motivai</h2>
              <p className="text-sm text-slate-400">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        {menuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                activeMenu === item.id ? "bg-slate-700 border-r-4 border-blue-500" : ""
              }`}
            >
              <IconComponent className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
