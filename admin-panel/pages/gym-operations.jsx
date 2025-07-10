"use client";

import { MapPin, Users, DollarSign, Search, Filter, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getAllGyms,
  getActiveGyms,
  deleteGym,
} from "../firebase/gymOperations.js";

export default function GymOperations() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGyms();
  }, []);

  async function fetchGyms() {
    try {
      setLoading(true);
      const allGyms = await getAllGyms();
      console.log("Tüm Spor Salonları:", allGyms);

      // Firebase GeoPoint verilerini string'e çevir
      const processedGyms = allGyms.map((gym) => ({
        ...gym,
        location:
          gym.location &&
          typeof gym.location === "object" &&
          gym.location.latitude
            ? `${gym.location.latitude}, ${gym.location.longitude}`
            : gym.location &&
              typeof gym.location === "object" &&
              gym.location._lat
            ? `${gym.location._lat}, ${gym.location._long}`
            : gym.location || gym.address || "Adres belirtilmemiş",
        address:
          gym.address && typeof gym.address === "object" && gym.address.latitude
            ? `${gym.address.latitude}, ${gym.address.longitude}`
            : gym.address && typeof gym.address === "object" && gym.address._lat
            ? `${gym.address._lat}, ${gym.address._long}`
            : gym.address || "Adres belirtilmemiş",
        price:
          gym.prices && gym.prices.length > 0
            ? gym.prices[0].amount
            : gym.price,
        occupancy: gym.occupancy || gym["occupancy "] || 0, // "occupancy " (boşluklu) field'ı da kontrol et
      }));

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
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Yeni Salon</span>
        </button>
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
                            {typeof gym.location === "string"
                              ? gym.location
                              : typeof gym.address === "string"
                              ? gym.address
                              : "Adres belirtilmemiş"}
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
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
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
    </div>
  );
}
