"use client";

import { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  User,
  Bot,
  Calendar,
  Activity,
  AlertCircle,
} from "lucide-react";
import { getChatMessages } from "../firebase/chatOperations.js";

export default function ChatDetailModal({
  userId,
  chatId,
  chatTitle,
  isOpen,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId && chatId) {
      fetchChatMessages();
    }
  }, [isOpen, userId, chatId]);

  const fetchChatMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Chat mesajları alınıyor:", { userId, chatId });

      const chatMessages = await getChatMessages(userId, chatId);
      setMessages(chatMessages);

      if (chatMessages.length === 0) {
        setError("Bu chat'te henüz mesaj bulunmuyor.");
      }
    } catch (error) {
      console.error("Chat mesajları alınırken hata:", error);
      setError("Chat mesajları yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case "user":
        return <User className="h-4 w-4 text-blue-600" />;
      case "assistant":
        return <Bot className="h-4 w-4 text-green-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "user":
        return "bg-blue-50 border-blue-200";
      case "assistant":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getRoleName = (role) => {
    switch (role?.toLowerCase()) {
      case "user":
        return "Kullanıcı";
      case "assistant":
        return "Asistan";
      default:
        return role || "Rol bulunamadı";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Chat Detayları
              </h2>
              <p className="text-sm text-gray-500">
                {chatTitle || `Chat ID: ${chatId}`}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Chat mesajları yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{error}</p>
              <button
                onClick={fetchChatMessages}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Bu chat'te henüz mesaj bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Toplam {messages.length} mesaj bulundu
                </p>
                <div className="text-xs text-gray-400">Chat ID: {chatId}</div>
              </div>

              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`border rounded-lg p-4 ${getRoleColor(
                      message.role
                    )}`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(message.role)}
                        <span className="font-semibold text-gray-900">
                          {getRoleName(message.role)}
                        </span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{message.formattedDate}</span>
                        </div>

                        {message.exercise &&
                          message.exercise !== "Egzersiz bulunamadı" && (
                            <div className="flex items-center space-x-1">
                              <Activity className="h-3 w-3" />
                              <span>{message.exercise}</span>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-gray-900 leading-relaxed">
                        {message.content &&
                        message.content !== "İçerik bulunamadı" ? (
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">
                            İçerik bulunamadı
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message Metadata */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">Rol:</span>
                          <div className="font-medium">
                            {message.role &&
                            message.role !== "Rol bulunamadı" ? (
                              message.role
                            ) : (
                              <span className="text-gray-400">Bulunamadı</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-500">Egzersiz:</span>
                          <div className="font-medium">
                            {message.exercise &&
                            message.exercise !== "Egzersiz bulunamadı" ? (
                              message.exercise
                            ) : (
                              <span className="text-gray-400">Bulunamadı</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-500">Timestamp:</span>
                          <div className="font-medium">
                            {message.ts ? (
                              <>
                                <div>{message.formattedDate}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Raw: {message.ts}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400">Bulunamadı</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-500">Mesaj ID:</span>
                          <div className="font-medium text-xs">
                            {message.id}
                          </div>
                        </div>
                      </div>

                      {/* Extra Info */}
                      {message.extra &&
                        Object.keys(message.extra).length > 1 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <span className="text-gray-500 text-xs">
                              Ek Bilgiler:
                            </span>
                            <div className="mt-1 bg-gray-50 rounded p-2 text-xs">
                              <pre className="whitespace-pre-wrap text-gray-700">
                                {JSON.stringify(message.extra, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {messages.length > 0 && (
                <span>Toplam {messages.length} mesaj görüntüleniyor</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
