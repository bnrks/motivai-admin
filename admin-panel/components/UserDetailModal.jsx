"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Calendar,
  Clock,
  Ruler,
  Weight,
  Users,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { getUserChatCount } from "../firebase/chatOperations.js";
import UserChatHistory from "./UserChatHistory.jsx";

export default function UserDetailModal({ user, isOpen, onClose }) {
  const [chatCount, setChatCount] = useState(0);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);

  // Chat sayısını yükle
  useEffect(() => {
    if (isOpen && user && user.id) {
      setLoadingChat(true);
      getUserChatCount(user.id)
        .then((count) => {
          setChatCount(count);
        })
        .catch((error) => {
          console.error("Chat sayısı yüklenirken hata:", error);
          setChatCount(0);
        })
        .finally(() => {
          setLoadingChat(false);
        });
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return "Belirtilmemiş";

    // Firebase Timestamp objesi kontrolü
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("tr-TR");
    }

    // Normal Date objesi
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString("tr-TR");
    }

    // String formatında tarih
    if (typeof timestamp === "string") {
      return new Date(timestamp).toLocaleDateString("tr-TR");
    }

    return "Belirtilmemiş";
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5)
      return { text: "Zayıf", color: "text-blue-600 bg-blue-100" };
    if (bmiValue < 25)
      return { text: "Normal", color: "text-green-600 bg-green-100" };
    if (bmiValue < 30)
      return { text: "Fazla Kilolu", color: "text-yellow-600 bg-yellow-100" };
    return { text: "Obez", color: "text-red-600 bg-red-100" };
  };

  const bmi = calculateBMI(user.weight, user.height);
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.name || "İsimsiz Kullanıcı"}
              </h2>
              <p className="text-gray-600">
                {user.mail || user.email || "Email yok"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Ana Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Kişisel Bilgiler */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Kişisel Bilgiler
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Yaş:</span>
                <span className="font-medium">
                  {user.age || "Belirtilmemiş"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cinsiyet:</span>
                <span className="font-medium">
                  {user.gender || "Belirtilmemiş"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rol:</span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === "Antrenör" || user.role === "antrenor"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.role || "Üye"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kayıt Tarihi:</span>
                <span className="font-medium">
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Fiziksel Bilgiler */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Ruler className="h-5 w-5 mr-2" />
              Fiziksel Bilgiler
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Boy:</span>
                <span className="font-medium">
                  {user.height ? `${user.height} cm` : "Belirtilmemiş"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kilo:</span>
                <span className="font-medium">
                  {user.weight ? `${user.weight} kg` : "Belirtilmemiş"}
                </span>
              </div>
              {bmi && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BMI:</span>
                    <span className="font-medium">{bmi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BMI Kategorisi:</span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${bmiCategory.color}`}
                    >
                      {bmiCategory.text}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Egzersiz Bilgileri */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Egzersiz Bilgileri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {user.exerciseMinutes || 0}
              </div>
              <div className="text-sm text-gray-600">Toplam Dakika</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {user.workoutCount || 0}
              </div>
              <div className="text-sm text-gray-600">Toplam Antrenman</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user.caloriesBurned || 0}
              </div>
              <div className="text-sm text-gray-600">Yakılan Kalori</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 flex items-center justify-center">
                {loadingChat ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                ) : (
                  chatCount
                )}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <MessageCircle className="h-3 w-3 mr-1" />
                Toplam Açılan Chat
              </div>
              {chatCount > 0 && (
                <button
                  onClick={() => setShowChatHistory(true)}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Chat Geçmişini Gör
                </button>
              )}
            </div>
          </div>
        </div>

        {/* İletişim ve Diğer Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* İletişim */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              İletişim
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">
                  {user.mail || user.email || "Belirtilmemiş"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telefon:</span>
                <span className="font-medium">
                  {user.phone || "Belirtilmemiş"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Şehir:</span>
                <span className="font-medium">
                  {user.city || "Belirtilmemiş"}
                </span>
              </div>
            </div>
          </div>

          {/* Diğer Bilgiler */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Diğer Bilgiler
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Üyelik Tipi:</span>
                <span className="font-medium">
                  {user.membershipType || "Standart"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durum:</span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Son Giriş:</span>
                <span className="font-medium">
                  {formatDate(user.lastLogin)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hedefler */}
        {user.goals && (
          <div className="bg-blue-50 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🎯 Hedefler
            </h3>
            <div className="text-gray-700">
              {typeof user.goals === "string"
                ? user.goals
                : JSON.stringify(user.goals)}
            </div>
          </div>
        )}

        {/* Notlar */}
        {user.notes && (
          <div className="bg-yellow-50 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📝 Notlar
            </h3>
            <div className="text-gray-700">{user.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>

      {/* Chat History Modal */}
      <UserChatHistory
        userId={user.id}
        userName={user.name || user.displayName || "Bilinmeyen Kullanıcı"}
        isOpen={showChatHistory}
        onClose={() => setShowChatHistory(false)}
      />
    </div>
  );
}
