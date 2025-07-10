"use client"

import { Menu, User, LogOut } from "lucide-react"

export default function TopHeader({ onToggleSidebar, onLogout }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">Admin User</span>
          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-red-600"
            title="Çıkış Yap"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
