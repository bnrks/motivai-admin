"use client";

import { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  Calendar,
  Clock,
  Activity,
  BarChart3,
  Filter,
} from "lucide-react";
import {
  getUserChatHistory,
  getUserChatStatistics,
} from "../firebase/chatOperations.js";
import ChatDetailModal from "./ChatDetailModal.jsx";

export default function UserChatHistory({ userId, userName, isOpen, onClose }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chat detail modal states
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatDetail, setShowChatDetail] = useState(false);

  // Statistics states
  const [statistics, setStatistics] = useState({
    totalChats: 0,
    totalMessages: 0,
    filteredChats: 0,
    filteredMessages: 0,
  });
  const [currentFilter, setCurrentFilter] = useState("all");
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchChatHistory();
      fetchStatistics();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (isOpen && userId) {
      if (currentFilter !== "all") {
        fetchFilteredChatHistory();
      } else {
        fetchChatHistory();
        fetchStatistics();
      }
    }
  }, [currentFilter]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Chat geçmişi alınıyor, User ID:", userId);

      const history = await getUserChatHistory(userId);
      setChatHistory(history);

      if (history.length === 0) {
        setError("Bu kullanıcının henüz chat geçmişi bulunmuyor.");
      }
    } catch (error) {
      console.error("Chat geçmişi alınırken hata:", error);
      setError("Chat geçmişi yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatisticsLoading(true);
      console.log("Chat istatistikleri alınıyor, Filter:", currentFilter);

      const stats = await getUserChatStatistics(userId, currentFilter);
      setStatistics(stats);
    } catch (error) {
      console.error("Chat istatistikleri alınırken hata:", error);
    } finally {
      setStatisticsLoading(false);
    }
  };

  const fetchFilteredChatHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Filtrelenmiş chat geçmişi alınıyor, Filter:", currentFilter);

      const stats = await getUserChatStatistics(userId, currentFilter);

      // İstatistikleri güncelle
      setStatistics((prev) => ({
        ...prev,
        filteredChats: stats.filteredChats,
        filteredMessages: stats.filteredMessages,
      }));

      // İstatistiklerden chat listesini al ve tam chat bilgilerini yükle
      if (stats.chatList && stats.chatList.length > 0) {
        // Her chat için analiz sayısını hesapla (mevcut getUserChatHistory mantığını kullan)
        const fullHistory = await getUserChatHistory(userId);

        // Filtrelenmiş chat'leri tam verilerle eşleştir
        const filteredChats = stats.chatList.map((filteredChat) => {
          const fullChat = fullHistory.find(
            (chat) => chat.id === filteredChat.id
          );
          return fullChat || filteredChat;
        });

        setChatHistory(filteredChats);
      } else {
        setChatHistory([]);
        setError(
          `${getFilterDisplayName(currentFilter)} dönemde chat bulunamadı.`
        );
      }
    } catch (error) {
      console.error("Filtrelenmiş chat geçmişi alınırken hata:", error);
      setError("Filtrelenmiş chat geçmişi yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType) => {
    setCurrentFilter(filterType);
  };

  const getFilterDisplayName = (filter) => {
    switch (filter) {
      case "daily":
        return "Günlük";
      case "weekly":
        return "Haftalık";
      case "monthly":
        return "Aylık";
      default:
        return "Tüm Zamanlar";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chat Geçmişi</h2>
              <p className="text-sm text-gray-500">{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Statistics Section */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Chat ve Mesaj İstatistikleri
              </h3>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
                {["all", "daily", "weekly", "monthly"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      currentFilter === filter
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {getFilterDisplayName(filter)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Toplam Chat
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statisticsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 rounded w-8 h-6"></span>
                    ) : currentFilter === "all" ? (
                      statistics.totalChats
                    ) : (
                      statistics.filteredChats
                    )}
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Toplam Mesaj
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statisticsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 rounded w-8 h-6"></span>
                    ) : currentFilter === "all" ? (
                      statistics.totalMessages
                    ) : (
                      statistics.filteredMessages
                    )}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Ortalama Mesaj/Chat
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statisticsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 rounded w-8 h-6"></span>
                    ) : (
                      (() => {
                        const chats =
                          currentFilter === "all"
                            ? statistics.totalChats
                            : statistics.filteredChats;
                        const messages =
                          currentFilter === "all"
                            ? statistics.totalMessages
                            : statistics.filteredMessages;
                        return chats > 0 ? Math.round(messages / chats) : 0;
                      })()
                    )}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Aktif Dönem
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {getFilterDisplayName(currentFilter)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Chat geçmişi yükleniyor...</p>
              <p className="mt-2 text-sm text-gray-500">
                Egzersiz analizleri hesaplanıyor...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{error}</p>
              <button
                onClick={fetchChatHistory}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Bu kullanıcının henüz chat geçmişi bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {currentFilter === "all"
                    ? `Toplam ${chatHistory.length} chat bulundu`
                    : `${getFilterDisplayName(currentFilter)} dönemde ${
                        chatHistory.length
                      } chat bulundu`}
                </p>
                {currentFilter !== "all" && (
                  <button
                    onClick={() => handleFilterChange("all")}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Tümünü Göster
                  </button>
                )}
              </div>

              <div className="grid gap-4">
                {chatHistory.map((chat, index) => (
                  <div
                    key={chat.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {chat.title || `Chat #${index + 1}`}
                          </h3>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            #{index + 1}
                          </span>
                          {chat.exerciseAnalysisCount > 0 && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              {chat.exerciseAnalysisCount} analiz
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 flex-wrap">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{chat.formattedDate}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Chat ID: {chat.id}</span>
                          </div>

                          {/* Egzersiz Analizi Bilgisi */}
                          <div className="flex items-center space-x-1">
                            <Activity className="h-4 w-4" />
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                chat.exerciseAnalysisCount > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {chat.exerciseAnalysisText ||
                                "Egzersiz analizi yok"}
                            </span>
                          </div>
                        </div>

                        {/* Eğer başka önemli alanlar varsa onları da gösterebiliriz */}
                        {chat.summary && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                              <span className="font-medium">Özet:</span>{" "}
                              {chat.summary}
                            </p>
                          </div>
                        )}

                        {chat.messageCount && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">
                              {chat.messageCount} mesaj
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        <button
                          onClick={() => {
                            setSelectedChat(chat);
                            setShowChatDetail(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Detayları Gör
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>

      {/* Chat Detail Modal */}
      {selectedChat && (
        <ChatDetailModal
          userId={userId}
          chatId={selectedChat.id}
          chatTitle={selectedChat.title}
          isOpen={showChatDetail}
          onClose={() => {
            setShowChatDetail(false);
            setSelectedChat(null);
          }}
        />
      )}
    </div>
  );
}
