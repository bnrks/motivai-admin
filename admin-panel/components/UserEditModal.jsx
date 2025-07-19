"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Calendar,
  Timer,
  Users,
  Ruler,
  Weight,
} from "lucide-react";

const UserEditModal = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    mail: "",
    age: "",
    exerciseMinutes: "",
    gender: "",
    height: "",
    weight: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || "",
        mail: user.mail || user.email || "",
        age: user.age || "",
        exerciseMinutes: user.exerciseMinutes || "",
        gender: user.gender || "",
        height: user.height || "",
        weight: user.weight || "",
        role: user.role || "",
      });
      setErrors({});
    }
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "İsim gereklidir";
    }

    if (!formData.mail.trim()) {
      newErrors.mail = "Email gereklidir";
    } else if (!/\S+@\S+\.\S+/.test(formData.mail)) {
      newErrors.mail = "Geçerli bir email adresi giriniz";
    }

    if (
      formData.age &&
      (isNaN(formData.age) || formData.age < 1 || formData.age > 120)
    ) {
      newErrors.age = "Geçerli bir yaş giriniz (1-120)";
    }

    if (
      formData.exerciseMinutes &&
      (isNaN(formData.exerciseMinutes) || formData.exerciseMinutes < 0)
    ) {
      newErrors.exerciseMinutes = "Geçerli bir egzersiz süresi giriniz";
    }

    if (
      formData.height &&
      (isNaN(formData.height) || formData.height < 50 || formData.height > 250)
    ) {
      newErrors.height = "Geçerli bir boy giriniz (50-250 cm)";
    }

    if (
      formData.weight &&
      (isNaN(formData.weight) || formData.weight < 20 || formData.weight > 300)
    ) {
      newErrors.weight = "Geçerli bir kilo giriniz (20-300 kg)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Sayısal değerleri dönüştür
      const processedData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        exerciseMinutes: formData.exerciseMinutes
          ? parseInt(formData.exerciseMinutes)
          : null,
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
      };

      await onSave(user.id, processedData);
      onClose();
    } catch (error) {
      console.error("Kullanıcı güncellenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Hata varsa temizle
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Kullanıcı Düzenle
              </h2>
              <p className="text-sm text-gray-500">
                {user?.name || "Kullanıcı"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Temel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                İsim *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Kullanıcı adı"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                Email *
              </label>
              <input
                type="email"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.mail ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="user@example.com"
              />
              {errors.mail && (
                <p className="mt-1 text-sm text-red-600">{errors.mail}</p>
              )}
            </div>
          </div>

          {/* Kişisel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                Yaş
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="120"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.age ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="25"
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600">{errors.age}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-500" />
                Cinsiyet
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="Erkek">Erkek</option>
                <option value="Kadın">Kadın</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-500" />
                Rol
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="Üye">Üye</option>
                <option value="Antrenör">Antrenör</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Fiziksel Özellikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                Boy (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="50"
                max="250"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.height ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="175"
              />
              {errors.height && (
                <p className="mt-1 text-sm text-red-600">{errors.height}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Weight className="h-4 w-4 mr-2 text-gray-500" />
                Kilo (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="20"
                max="300"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.weight ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="70"
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Timer className="h-4 w-4 mr-2 text-gray-500" />
                Egzersiz (dk)
              </label>
              <input
                type="number"
                name="exerciseMinutes"
                value={formData.exerciseMinutes}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.exerciseMinutes ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="60"
              />
              {errors.exerciseMinutes && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.exerciseMinutes}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
