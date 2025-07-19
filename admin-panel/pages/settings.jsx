"use client";

import { useEffect, useState } from "react";
import { Globe, Save, Edit, Bot, Plus, X, RefreshCw } from "lucide-react";
import {
  getApiUrl,
  updateApiUrl,
  getModelsSettings,
  updateBaseModel,
  updateAvailableModels,
  updateModelsSettings,
} from "../firebase/settingsOperations.js";
export default function SettingsPage() {
  // API URL States
  const [apiUrl, setApiUrl] = useState("Yükleniyor..");
  const [isEditing, setIsEditing] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Model Settings States
  const [baseModel, setBaseModel] = useState("");
  const [availableModels, setAvailableModels] = useState([]);
  const [isEditingModels, setIsEditingModels] = useState(false);
  const [tempBaseModel, setTempBaseModel] = useState("");
  const [tempAvailableModels, setTempAvailableModels] = useState([]);
  const [newModel, setNewModel] = useState("");
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState(null);
  const [modelsSuccess, setModelsSuccess] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Tüm verileri yeniden yükle
  const fetchAllData = async () => {
    setRefreshLoading(true);
    try {
      await Promise.all([fetchApiUrl(), fetchModels()]);
    } catch (error) {
      console.error("Veriler yüklenirken hata:", error);
    } finally {
      setRefreshLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchApiUrl = async () => {
    try {
      setLoading(true);
      const url = await getApiUrl();
      if (url) {
        setApiUrl(url);
        setTempApiUrl(url);
      } else {
        setApiUrl("API URL ayarlanmamış");
        setTempApiUrl("");
      }
    } catch (error) {
      setError("API URL yüklenirken hata oluştu");
      console.error("API URL fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      setModelsLoading(true);
      const models = await getModelsSettings();
      setBaseModel(models.base_model || "");
      setAvailableModels(models.availableModels || []);
      setTempBaseModel(models.base_model || "");
      setTempAvailableModels(models.availableModels || []);
    } catch (error) {
      setModelsError("Model bilgileri yüklenirken hata oluştu");
      console.error("Models fetch error:", error);
    } finally {
      setModelsLoading(false);
    }
  };
  const handleEdit = (value) => {
    setTempApiUrl(value);
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!tempApiUrl.trim()) {
      setError("API URL boş olamaz");
      return;
    }

    try {
      // URL format kontrolü
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(tempApiUrl)) {
        setError(
          "Geçerli bir URL formatı girin (http:// veya https:// ile başlamalı)"
        );
        return;
      }

      setLoading(true);
      setError(null);

      await updateApiUrl(tempApiUrl);

      setApiUrl(tempApiUrl);
      setIsEditing(false);
      setSuccess(true);

      // Başarı mesajını 3 saniye sonra gizle
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError("API URL güncellenirken hata oluştu: " + error.message);
      console.error("API URL update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTempApiUrl(apiUrl);
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  };

  const startEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(false);
  };

  // Model Settings Functions
  const handleModelsEdit = () => {
    setIsEditingModels(true);
    setModelsError(null);
    setModelsSuccess(false);
  };

  const handleAddModel = () => {
    if (newModel.trim() && !tempAvailableModels.includes(newModel.trim())) {
      setTempAvailableModels([...tempAvailableModels, newModel.trim()]);
      setNewModel("");
    }
  };

  const handleRemoveModel = (modelToRemove) => {
    setTempAvailableModels(
      tempAvailableModels.filter((model) => model !== modelToRemove)
    );
    // Eğer silinen model base model ise, base model'i temizle
    if (tempBaseModel === modelToRemove) {
      setTempBaseModel("");
    }
  };

  const handleSaveModels = async () => {
    try {
      setModelsLoading(true);
      setModelsError(null);

      await updateModelsSettings(tempBaseModel, tempAvailableModels);

      setBaseModel(tempBaseModel);
      setAvailableModels(tempAvailableModels);
      setIsEditingModels(false);
      setModelsSuccess(true);

      // Başarı mesajını 3 saniye sonra gizle
      setTimeout(() => setModelsSuccess(false), 3000);
    } catch (error) {
      setModelsError(
        "Model ayarları güncellenirken hata oluştu: " + error.message
      );
      console.error("Models update error:", error);
    } finally {
      setModelsLoading(false);
    }
  };

  const handleCancelModels = () => {
    setTempBaseModel(baseModel);
    setTempAvailableModels(availableModels);
    setNewModel("");
    setIsEditingModels(false);
    setModelsError(null);
    setModelsSuccess(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Sistem Ayarları</h1>
        <button
          onClick={fetchAllData}
          disabled={refreshLoading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            refreshLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
          title="Tüm Ayarları Yenile"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshLoading ? "animate-spin" : ""}`}
          />
          <span>{refreshLoading ? "Yenileniyor..." : "Yenile"}</span>
        </button>
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
          {/* Başarı Mesajı */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <div className="flex items-center">
                <div className="h-4 w-4 text-green-500 mr-2">✓</div>
                API URL başarıyla güncellendi!
              </div>
            </div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <div className="h-4 w-4 text-red-500 mr-2">✗</div>
                {error}
              </div>
            </div>
          )}

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
                    onChange={(e) => handleEdit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://api.example.com/v1"
                    disabled={loading}
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4" />
                      <span>{loading ? "Kaydediliyor..." : "Kaydet"}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-900 font-mono">
                      {loading ? "Yükleniyor..." : apiUrl}
                    </span>
                  </div>
                  <button
                    onClick={startEdit}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Model Ayarları */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Model Ayarları</h2>
          </div>
        </div>
        <div className="p-6">
          {/* Başarı Mesajı */}
          {modelsSuccess && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <div className="flex items-center">
                <div className="h-4 w-4 text-green-500 mr-2">✓</div>
                Model ayarları başarıyla güncellendi!
              </div>
            </div>
          )}

          {/* Hata Mesajı */}
          {modelsError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <div className="h-4 w-4 text-red-500 mr-2">✗</div>
                {modelsError}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Base Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Varsayılan Model
              </label>
              {isEditingModels ? (
                <select
                  value={tempBaseModel}
                  onChange={(e) => setTempBaseModel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={modelsLoading}
                >
                  <option value="">Model seçin...</option>
                  {tempAvailableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Bot className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-900 font-mono">
                      {modelsLoading
                        ? "Yükleniyor..."
                        : baseModel || "Model seçilmemiş"}
                    </span>
                  </div>
                  <button
                    onClick={handleModelsEdit}
                    disabled={modelsLoading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Düzenle</span>
                  </button>
                </div>
              )}
            </div>

            {/* Available Models */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanılabilir Modeller
              </label>
              {isEditingModels ? (
                <div className="space-y-4">
                  {/* Model Ekleme */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      placeholder="Yeni model ekle..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      disabled={modelsLoading}
                      onKeyPress={(e) => e.key === "Enter" && handleAddModel()}
                    />
                    <button
                      onClick={handleAddModel}
                      disabled={modelsLoading || !newModel.trim()}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Ekle</span>
                    </button>
                  </div>

                  {/* Model Listesi */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {tempAvailableModels.map((model, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <span className="text-gray-900 font-mono">{model}</span>
                        <button
                          onClick={() => handleRemoveModel(model)}
                          disabled={modelsLoading}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {tempAvailableModels.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        Henüz model eklenmemiş
                      </div>
                    )}
                  </div>

                  {/* Kaydet/İptal Butonları */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSaveModels}
                      disabled={modelsLoading}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4" />
                      <span>
                        {modelsLoading ? "Kaydediliyor..." : "Kaydet"}
                      </span>
                    </button>
                    <button
                      onClick={handleCancelModels}
                      disabled={modelsLoading}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableModels.map((model, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <Bot className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 font-mono">{model}</span>
                      {model === baseModel && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          Varsayılan
                        </span>
                      )}
                    </div>
                  ))}
                  {availableModels.length === 0 && !modelsLoading && (
                    <div className="text-center py-4 text-gray-500">
                      Henüz model tanımlanmamış
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <p>
                Burada uygulamada kullanılabilir AI modellerini
                yönetebilirsiniz. Varsayılan model, yeni sohbetlerde otomatik
                olarak seçilecek modeldir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
