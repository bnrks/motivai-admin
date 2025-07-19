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
  TrendingUp,
  PieChart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { getUserChatHistory } from "../firebase/chatOperations.js";
import ChatDetailModal from "./ChatDetailModal.jsx";

export default function UserChatHistory({ userId, userName, isOpen, onClose }) {
  const [allChatHistory, setAllChatHistory] = useState([]); // Tüm veriler burada tutulur
  const [filteredChatHistory, setFilteredChatHistory] = useState([]); // Filtrelenmiş veriler
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

  useEffect(() => {
    if (isOpen && userId) {
      fetchAllChatHistory();
    }
  }, [isOpen, userId]);

  // Filter değiştiğinde filtreleme uygula
  useEffect(() => {
    if (allChatHistory.length > 0) {
      applyClientSideFilter();
    }
  }, [currentFilter, allChatHistory]);

  const fetchAllChatHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Tüm chat geçmişi alınıyor, User ID:", userId);

      const history = await getUserChatHistory(userId);
      setAllChatHistory(history);

      if (history.length === 0) {
        setError("Bu kullanıcının henüz chat geçmişi bulunmuyor.");
        setFilteredChatHistory([]);
      } else {
        // İlk yüklemede tüm verileri göster
        setFilteredChatHistory(history);
        calculateStatistics(history, history);
      }
    } catch (error) {
      console.error("Chat geçmişi alınırken hata:", error);
      setError("Chat geçmişi yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const applyClientSideFilter = () => {
    console.log("Client-side filtreleme uygulanıyor, Filter:", currentFilter);

    if (currentFilter === "all") {
      setFilteredChatHistory(allChatHistory);
      calculateStatistics(allChatHistory, allChatHistory);
      setError(null);
      return;
    }

    // Tarih filtresi hesapla
    const now = new Date();
    let startDate;

    switch (currentFilter) {
      case "daily":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Son 24 saat
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Son 7 gün
        break;
      case "monthly":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Son 30 gün
        break;
      default:
        setFilteredChatHistory(allChatHistory);
        calculateStatistics(allChatHistory, allChatHistory);
        return;
    }

    console.log("Filtreleme başlangıç tarihi:", startDate);

    // Chat'leri filtrele - hem chat tarihi hem de mesaj tarihlerine bak
    const filtered = allChatHistory.filter((chat) => {
      // Önce chat'in createdAt tarihini kontrol et
      let chatDate = null;

      if (chat.createdAt) {
        if (chat.createdAt.toDate) {
          chatDate = chat.createdAt.toDate();
        } else if (chat.createdAt.seconds) {
          chatDate = new Date(chat.createdAt.seconds * 1000);
        } else if (typeof chat.createdAt === "number") {
          // Timestamp dönüşümü
          let timestamp = chat.createdAt;
          if (timestamp < 1e12) {
            timestamp = timestamp * 1000;
          }
          chatDate = new Date(timestamp);
        } else {
          chatDate = new Date(chat.createdAt);
        }
      }

      // Chat tarihi ile kontrol et
      if (chatDate && chatDate >= startDate) {
        console.log(`Chat ${chat.id} tarih filtresi geçti:`, chatDate);
        return true;
      }

      // Eğer chat tarihi yoksa veya eski ise, mesaj tarihlerine bak
      // Bu kısımda chat içindeki mesajların tarihlerine bakabiliriz
      // Şimdilik sadece chat tarihi ile kontrol edelim

      console.log(`Chat ${chat.id} tarih filtresi geçemedi:`, chatDate);
      return false;
    });

    console.log(`Filtreleme sonucu: ${filtered.length} chat bulundu`);

    setFilteredChatHistory(filtered);
    calculateStatistics(allChatHistory, filtered);

    if (filtered.length === 0) {
      setError(
        `${getFilterDisplayName(currentFilter)} dönemde chat bulunamadı.`
      );
    } else {
      setError(null);
    }
  };

  const calculateStatistics = (allChats, filteredChats) => {
    const totalMessages = allChats.reduce(
      (total, chat) => total + (chat.messageCount || 0),
      0
    );
    const filteredMessages = filteredChats.reduce(
      (total, chat) => total + (chat.messageCount || 0),
      0
    );

    setStatistics({
      totalChats: allChats.length,
      totalMessages: totalMessages,
      filteredChats: filteredChats.length,
      filteredMessages: filteredMessages,
    });
  };

  const handleFilterChange = (filterType) => {
    setCurrentFilter(filterType);
  };

  // Grafik verileri hazırlama fonksiyonları
  const prepareChartData = () => {
    if (!allChatHistory.length) return [];

    // Son 7 günlük veriler için
    const last7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
      });

      // O günkü chat sayısını hesapla
      const chatsForDay = allChatHistory.filter((chat) => {
        let chatDate = null;

        if (chat.createdAt) {
          if (chat.createdAt.toDate) {
            chatDate = chat.createdAt.toDate();
          } else if (chat.createdAt.seconds) {
            chatDate = new Date(chat.createdAt.seconds * 1000);
          } else if (typeof chat.createdAt === "number") {
            let timestamp = chat.createdAt;
            if (timestamp < 1e12) timestamp = timestamp * 1000;
            chatDate = new Date(timestamp);
          }
        }

        if (chatDate) {
          const chatDateStr = chatDate.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
          });
          return chatDateStr === dateStr;
        }
        return false;
      });

      const messagesForDay = chatsForDay.reduce(
        (total, chat) => total + (chat.messageCount || 0),
        0
      );

      last7Days.push({
        date: dateStr,
        chats: chatsForDay.length,
        messages: messagesForDay,
        exercises: chatsForDay.reduce(
          (total, chat) => total + (chat.exerciseAnalysisCount || 0),
          0
        ),
      });
    }

    return last7Days;
  };

  const preparePieChartData = () => {
    const totalChats = statistics.totalChats;
    const totalMessages = statistics.totalMessages;
    const totalExercises = allChatHistory.reduce(
      (total, chat) => total + (chat.exerciseAnalysisCount || 0),
      0
    );

    return [
      { name: "Chat'ler", value: totalChats, color: "#3B82F6" },
      { name: "Mesajlar", value: totalMessages, color: "#10B981" },
      { name: "Egzersiz Analizleri", value: totalExercises, color: "#F59E0B" },
    ];
  };

  const prepareFilterComparisonData = () => {
    const allData = {
      name: "Tümü",
      chats: statistics.totalChats,
      messages: statistics.totalMessages,
    };

    const filteredData = {
      name: getFilterDisplayName(currentFilter),
      chats: statistics.filteredChats,
      messages: statistics.filteredMessages,
    };

    return currentFilter === "all" ? [allData] : [allData, filteredData];
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
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header - Sabit */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
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
        {/* Scrollable Content - Tüm içerik scroll edilebilir */}
        <div className="flex-1 overflow-y-auto">
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
                      {currentFilter === "all"
                        ? statistics.totalChats
                        : statistics.filteredChats}
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
                      {currentFilter === "all"
                        ? statistics.totalMessages
                        : statistics.filteredMessages}
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
                      {(() => {
                        const chats =
                          currentFilter === "all"
                            ? statistics.totalChats
                            : statistics.filteredChats;
                        const messages =
                          currentFilter === "all"
                            ? statistics.totalMessages
                            : statistics.filteredMessages;
                        return chats > 0 ? Math.round(messages / chats) : 0;
                      })()}
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
          {/* Charts Section - Kompakt Görünüm */}
          {!loading && !error && allChatHistory.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  📊 Hızlı Analiz
                </h3>
                <span className="text-xs text-gray-500">
                  (Detaylı chat listesi aşağıda)
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Son 7 Günlük Aktivite - Mini */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                    <BarChart3 className="h-3 w-3 mr-1 text-blue-600" />7 Günlük
                  </h4>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={prepareChartData()}>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "4px",
                            fontSize: "10px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="chats"
                          stackId="1"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.6}
                          name="Chat"
                        />
                        <Area
                          type="monotone"
                          dataKey="exercises"
                          stackId="1"
                          stroke="#F59E0B"
                          fill="#F59E0B"
                          fillOpacity={0.6}
                          name="Egzersiz"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Mesaj Trendi - Mini */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                    <MessageCircle className="h-3 w-3 mr-1 text-green-600" />
                    Mesaj Trendi
                  </h4>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareChartData()}>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "4px",
                            fontSize: "10px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="messages"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ fill: "#10B981", strokeWidth: 1, r: 2 }}
                          name="Mesaj"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Filtre Karşılaştırması - Mini */}
                {currentFilter !== "all" && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <h4 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                      <Filter className="h-3 w-3 mr-1 text-purple-600" />
                      Karşılaştır
                    </h4>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={prepareFilterComparisonData()}>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "4px",
                              fontSize: "10px",
                            }}
                          />
                          <Bar dataKey="chats" fill="#3B82F6" name="Chat" />
                          <Bar dataKey="messages" fill="#10B981" name="Mesaj" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Aktivite Dağılımı - Mini */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                    <PieChart className="h-3 w-3 mr-1 text-orange-600" />
                    Dağılım
                  </h4>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={preparePieChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={15}
                          outerRadius={30}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {preparePieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "4px",
                            fontSize: "10px",
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Chat History Content */}
          <div className="p-6">
            {!loading && !error && allChatHistory.length > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    💬 Chat Geçmişi Detayları
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Aşağıda kullanıcının tüm chat oturumları ve detayları
                  listelenmektedir.
                </p>
              </div>
            )}

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
                  onClick={fetchAllChatHistory}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : filteredChatHistory.length === 0 ? (
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
                      ? `Toplam ${filteredChatHistory.length} chat bulundu`
                      : `${getFilterDisplayName(currentFilter)} dönemde ${
                          filteredChatHistory.length
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
                  {filteredChatHistory.map((chat, index) => (
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
          </div>{" "}
          {/* Scrollable Content kapanışı */}
        </div>{" "}
        {/* Modal kapanışı */}
      </div>{" "}
      {/* Overlay kapanışı */}
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
