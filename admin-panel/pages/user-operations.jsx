"use client";

import { Users, Search, Filter, Edit, Trash2, RefreshCw } from "lucide-react";
import {
  getAllUsers,
  getUserById,
  getActiveUsers,
  updateUser,
  deleteUser,
} from "../firebase/userOperations.js";
import { useState, useEffect } from "react";
import UserDetailModal from "../components/UserDetailModal.jsx";
import UserEditModal from "../components/UserEditModal.jsx";

export default function UserOperations() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Arama işlevi
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.mail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      console.log("Tüm Kullanıcılar:", allUsers);
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      setError(null);
    } catch (error) {
      console.error("Kullanıcılar alınırken hata oluştu:", error);
      setError("Kullanıcılar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  // Modal functions
  const openDetailModal = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedUser(null);
    setIsDetailModalOpen(false);
  };

  // Edit modal functions
  const openEditModal = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setIsEditModalOpen(false);
  };

  // Kullanıcı güncelleme
  const handleUpdateUser = async (userId, userData) => {
    try {
      await updateUser(userId, userData);

      // Kullanıcıları yeniden yükle
      await fetchUsers();

      alert("Kullanıcı başarıyla güncellendi!");
    } catch (error) {
      console.error("Kullanıcı güncellenirken hata:", error);
      alert("Kullanıcı güncellenirken bir hata oluştu!");
    }
  };

  // Kullanıcı silme
  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `"${userName}" adlı kullanıcıyı silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`
    );

    if (!confirmed) return;

    try {
      await deleteUser(userId);

      // Kullanıcıları yeniden yükle
      await fetchUsers();

      alert("Kullanıcı başarıyla silindi!");
    } catch (error) {
      console.error("Kullanıcı silinirken hata:", error);
      alert("Kullanıcı silinirken bir hata oluştu!");
    }
  };

  // Arama fonksiyonu
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Kullanıcı İşlemleri
        </h1>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          title="Verileri Yenile"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Yenileniyor..." : "Yenile"}</span>
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Toplam Kullanıcı</h3>
              <p className="text-3xl font-bold mt-2">{users.length}</p>
            </div>
            <Users className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Arama Sonucu</h3>
              <p className="text-3xl font-bold mt-2">{filteredUsers.length}</p>
            </div>
            <Search className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Kullanıcı Listesi */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Kullanıcı Listesi</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Kullanıcı ara (isim, email)..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                <span>Filtrele</span>
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-lg">Kullanıcılar yükleniyor...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <div className="text-lg">{error}</div>
              <button
                onClick={fetchUsers}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Tekrar Dene
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? (
                <div>
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg">
                    "{searchTerm}" için sonuç bulunamadı
                  </div>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Aramayı temizle
                  </button>
                </div>
              ) : (
                <div className="text-lg">Henüz kullanıcı bulunmuyor.</div>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yaş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Egzersiz (dk)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cinsiyet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Boy (cm)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kilo (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || "İsimsiz"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.mail || user.email || "Email yok"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.age || "Belirtilmemiş"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.exerciseMinutes || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.gender || "Belirtilmemiş"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.height || "Belirtilmemiş"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.weight || "Belirtilmemiş"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "Antrenör" || user.role === "antrenor"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role || "Üye"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openDetailModal(user)}
                        className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                        title="Detayları Görüntüle"
                      >
                        <Search className="h-4 w-4" />
                        <span>Detay</span>
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 mt-1"
                        title="Kullanıcıyı Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Düzenle</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-red-600 hover:text-red-900 flex items-center space-x-1 mt-1"
                        title="Kullanıcıyı Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Sil</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
      />

      {/* User Edit Modal */}
      <UserEditModal
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleUpdateUser}
      />
    </div>
  );
}
