"use client";

import { useState } from "react";
import { Globe, Save, Edit } from "lucide-react";

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState("https://api.gymmanagement.com/v1");
  const [isEditing, setIsEditing] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);

  const handleEdit = () => {
    setIsEditing(true);
    setTempApiUrl(apiUrl);
  };

  const handleSave = () => {
    setApiUrl(tempApiUrl);
    setIsEditing(false);
    // Burada backend'e kaydetme işlemi yapılacak
    console.log("API URL güncellendi:", tempApiUrl);
  };

  const handleCancel = () => {
    setTempApiUrl(apiUrl);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Sistem Ayarları</h1>
      </div>

      {/* API URL Ayarı */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Globe className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">API Ayarları</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API URL
              </label>
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="url"
                    value={tempApiUrl}
                    onChange={(e) => setTempApiUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://api.example.com/v1"
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Kaydet</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-900 font-mono">{apiUrl}</span>
                  </div>
                  <button
                    onClick={handleEdit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Düzenle</span>
                  </button>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600">
              <p>
                Bu URL, uygulamanın backend servisleriyle iletişim kurması için
                kullanılır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
