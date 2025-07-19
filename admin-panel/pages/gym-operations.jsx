"use client";

import {
  MapPin,
  Users,
  DollarSign,
  Search,
  Filter,
  Plus,
  Edit2,
  X,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  getAllGyms,
  getActiveGyms,
  deleteGym,
  addGym,
  updateGym,
} from "../firebase/gymOperations.js";
import LocationPicker from "../components/LocationPicker.jsx";

export default function GymOperations() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGym, setEditingGym] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    location: { latitude: "", longitude: "" },
    capacity: "",
    occupancy: "",
    price: "",
    type: "gym",
  });

  useEffect(() => {
    fetchGyms();
  }, []);

  // Koordinatları şehir ve ilçe bilgisine çeviren fonksiyon
  const getLocationFromCoordinates = async (lat, lon) => {
    // Server-side rendering kontrolü
    if (typeof window === "undefined") {
      return `${lat}, ${lon}`; // Server tarafında sadece koordinatları döndür
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=tr`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Konum verisi:", data);

      // display_name varsa onu kullan
      if (data.display_name) {
        return data.display_name;
      }

      // Fallback olarak koordinatları göster
      return `${lat}, ${lon}`;
    } catch (error) {
      console.error("Konum bilgisi alınırken hata:", error);
      return `${lat}, ${lon}`; // Hata durumunda koordinatları göster
    }
  };

  async function fetchGyms() {
    try {
      setLoading(true);
      const allGyms = await getAllGyms();
      console.log("Tüm Spor Salonları:", allGyms);

      // Firebase GeoPoint verilerini işle ve konum bilgilerini al
      // Rate limiting için istekleri sıralı olarak gönder
      const processedGyms = [];

      for (let i = 0; i < allGyms.length; i++) {
        const gym = allGyms[i];
        let locationText = "Adres belirtilmemiş";

        console.log(
          `Konum bilgisi alınıyor: ${gym.name || `Gym ${i + 1}`} (${i + 1}/${
            allGyms.length
          })`
        );

        // Koordinat bilgisi varsa şehir/ilçe bilgisini al
        if (gym.location && typeof gym.location === "object") {
          if (gym.location.latitude && gym.location.longitude) {
            locationText = await getLocationFromCoordinates(
              gym.location.latitude,
              gym.location.longitude
            );
          } else if (gym.location._lat && gym.location._long) {
            locationText = await getLocationFromCoordinates(
              gym.location._lat,
              gym.location._long
            );
          }
        } else if (typeof gym.location === "string") {
          locationText = gym.location;
        } else if (gym.address && typeof gym.address === "string") {
          locationText = gym.address;
        }

        const processedGym = {
          ...gym,
          location: locationText,
          price:
            gym.prices && gym.prices.length > 0
              ? gym.prices[0].amount
              : gym.price,
          occupancy: gym.occupancy || gym["occupancy "] || 0,
        };

        processedGyms.push(processedGym);

        // Her istek arasında 1 saniye bekle (son gym hariç)
        if (i < allGyms.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 75));
        }
      }

      setGyms(processedGyms);
      setError(null);
    } catch (error) {
      console.error("Spor salonları alınırken hata oluştu:", error);
      setError("Spor salonları yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteGym(gymId) {
    if (
      window.confirm("Bu spor salonunu silmek istediğinizden emin misiniz?")
    ) {
      try {
        await deleteGym(gymId);
        setGyms(gyms.filter((gym) => gym.id !== gymId));
        console.log("Spor salonu başarıyla silindi");
      } catch (error) {
        console.error("Spor salonu silinirken hata oluştu:", error);
        alert("Spor salonu silinirken bir hata oluştu.");
      }
    }
  }

  // Modal functions
  const openAddModal = () => {
    setEditingGym(null);
    setFormData({
      name: "",
      location: { latitude: "", longitude: "" },
      capacity: "",
      occupancy: "",
      price: "",
      type: "gym",
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (gym) => {
    setEditingGym(gym);

    // Mevcut koordinatları al
    let lat = "";
    let lng = "";

    if (gym.location && typeof gym.location === "object") {
      if (gym.location.latitude && gym.location.longitude) {
        lat = gym.location.latitude.toString();
        lng = gym.location.longitude.toString();
      } else if (gym.location._lat && gym.location._long) {
        lat = gym.location._lat.toString();
        lng = gym.location._long.toString();
      }
    }

    setFormData({
      name: gym.name || "",
      location: { latitude: lat, longitude: lng },
      capacity: gym.capacity || "",
      occupancy: gym.occupancy || gym["occupancy "] || "",
      price: gym.prices?.[0]?.amount || gym.price || "",
      type: gym.type || "gym",
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGym(null);
    setModalError(null);
    setFormData({
      name: "",
      location: { latitude: "", longitude: "" },
      capacity: "",
      occupancy: "",
      price: "",
      type: "gym",
    });
  };

  const handleFormChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleLocationChange = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        latitude: lat.toString(),
        longitude: lng.toString(),
      },
    }));
  };

  const handleSaveGym = async () => {
    try {
      // Validation
      if (!formData.name.trim()) {
        setModalError("Spor salonu adı zorunludur");
        return;
      }

      if (!formData.location.latitude || !formData.location.longitude) {
        setModalError("Koordinat bilgileri zorunludur");
        return;
      }

      setModalLoading(true);
      setModalError(null);

      const gymData = {
        name: formData.name.trim(),
        location: {
          latitude: parseFloat(formData.location.latitude),
          longitude: parseFloat(formData.location.longitude),
        },
        capacity: parseInt(formData.capacity) || 0,
        "occupancy ": parseInt(formData.occupancy) || 0,
        prices: [
          {
            title: "aylik",
            amount: parseInt(formData.price) || 0,
          },
        ],
        type: formData.type,
      };

      if (editingGym) {
        // Güncelleme
        await updateGym(editingGym.id, gymData);
        console.log("Spor salonu başarıyla güncellendi");
      } else {
        // Yeni ekleme
        await addGym(gymData);
        console.log("Spor salonu başarıyla eklendi");
      }

      // Listeyi yenile
      await fetchGyms();
      closeModal();
    } catch (error) {
      console.error("Spor salonu kaydedilirken hata:", error);
      setModalError("İşlem sırasında bir hata oluştu: " + error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const getOccupancyPercentage = (occupancy, capacity) => {
    return Math.round((occupancy / capacity) * 100);
  };

  const getOccupancyColor = (percentage) => {
    if (percentage >= 90) return "text-red-600 bg-red-100";
    if (percentage >= 70) return "text-orange-600 bg-orange-100";
    if (percentage >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  // Güvenli veri render fonksiyonu
  const safeRender = (value, fallback = "Belirtilmemiş") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "object") {
      // GeoPoint objesi kontrolü
      if (value._lat && value._long) {
        return `${value._lat}, ${value._long}`;
      }
      if (value.latitude && value.longitude) {
        return `${value.latitude}, ${value.longitude}`;
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Fiyat bilgisini güvenli şekilde render etmek için özel fonksiyon
  const renderPrice = (gym) => {
    if (gym.prices && gym.prices.length > 0) {
      return gym.prices[0].amount;
    }
    if (gym.price) {
      return gym.price;
    }
    return "Belirtilmemiş";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gym İşlemleri</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchGyms}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            title="Verileri Yenile"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Yenileniyor..." : "Yenile"}</span>
          </button>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Salon</span>
          </button>
        </div>
      </div>

      {/* Spor Salonları Listesi */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Spor Salonları</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Salon ara..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-lg">Spor salonları yükleniyor...</div>
              <div className="text-sm text-gray-500 mt-2">
                Konum bilgileri API'den alınıyor, lütfen bekleyiniz...
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <div className="text-lg">{error}</div>
              <button
                onClick={fetchGyms}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Tekrar Dene
              </button>
            </div>
          ) : gyms.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-lg">Henüz spor salonu bulunmuyor.</div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salon Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Konum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kapasite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doluluk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aylık Ücret
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gyms.map((gym) => {
                  const occupancyPercentage = getOccupancyPercentage(
                    gym.occupancy || 0,
                    gym.capacity || 1
                  );
                  return (
                    <tr key={gym.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {gym.name?.charAt(0) || "G"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {gym.name || "İsimsiz Salon"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="max-w-xs truncate">
                            {gym.location || "Adres belirtilmemiş"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{safeRender(gym.capacity)} kişi</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 mr-2">
                            {safeRender(
                              gym.occupancy || gym["occupancy "],
                              "0"
                            )}
                            /{safeRender(gym.capacity, "0")}
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOccupancyColor(
                              occupancyPercentage
                            )}`}
                          >
                            %{occupancyPercentage}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{renderPrice(gym)} ₺</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            gym.type === "Spor Salonu"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {safeRender(gym.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditModal(gym)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDeleteGym(gym.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingGym ? "Spor Salonu Düzenle" : "Yeni Spor Salonu"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spor Salonu Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Spor salonu adını girin"
                />
              </div>

              {/* Harita Bileşeni */}
              <div>
                <LocationPicker
                  latitude={formData.location.latitude}
                  longitude={formData.location.longitude}
                  onLocationChange={handleLocationChange}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasite
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      handleFormChange("capacity", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mevcut Doluluk
                  </label>
                  <input
                    type="number"
                    value={formData.occupancy}
                    onChange={(e) =>
                      handleFormChange("occupancy", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aylık Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleFormChange("price", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleFormChange("type", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="gym">Spor Salonu</option>
                    <option value="fitness">Fitness</option>
                    <option value="crossfit">CrossFit</option>
                    <option value="yoga">Yoga</option>
                    <option value="pilates">Pilates</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={modalLoading}
              >
                İptal
              </button>
              <button
                onClick={handleSaveGym}
                disabled={modalLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {modalLoading
                  ? "Kaydediliyor..."
                  : editingGym
                  ? "Güncelle"
                  : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
