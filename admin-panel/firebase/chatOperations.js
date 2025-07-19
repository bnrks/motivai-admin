import { db } from "./firebaseConfig.js";
import { collection, doc, getDocs, query, where } from "firebase/firestore";

// Kullanıcının toplam chat sayısını getir
export const getUserChatCount = async (userId) => {
  try {
    if (!userId) {
      console.log("User ID bulunamadı");
      return 0;
    }

    console.log("Aranan User ID:", userId);

    // chats collection altında kullanıcının UID'si ile aynı ID'ye sahip document
    const chatDocRef = doc(db, "chats", userId);

    // Bu document altındaki histories subcollection'unu al
    const historiesCollection = collection(chatDocRef, "histories");
    const historiesSnapshot = await getDocs(historiesCollection);

    console.log("Histories Snapshot:", historiesSnapshot);
    console.log("Histories Collection Path:", `chats/${userId}/histories`);
    console.log(
      `Kullanıcı ${userId} için toplam chat sayısı:`,
      historiesSnapshot.size
    );

    // Debug için document'ları listele
    if (historiesSnapshot.size > 0) {
      console.log("Bulunan chat document'ları:");
      historiesSnapshot.forEach((doc) => {
        console.log("- Chat ID:", doc.id, "Data:", doc.data());
      });
    } else {
      console.log("Hiç chat history bulunamadı");
    }

    return historiesSnapshot.size;
  } catch (error) {
    console.error("Chat sayısı alınırken hata:", error);
    console.error("Hata detayı:", error.message);
    return 0;
  }
};

// Kullanıcının chat geçmişini detaylı olarak getir
export const getUserChatHistory = async (userId) => {
  try {
    if (!userId) return [];

    console.log("Chat geçmişi alınıyor, User ID:", userId);

    const chatDocRef = doc(db, "chats", userId);
    const historiesCollection = collection(chatDocRef, "histories");
    const historiesSnapshot = await getDocs(historiesCollection);

    // Her chat için analiz sayısını hesaplamak için paralel olarak işle
    const chatHistoryPromises = historiesSnapshot.docs.map(async (doc) => {
      const data = doc.data();

      // createdAt timestamp'ını tarihe çevir
      let formattedDate = "Tarih belirtilmemiş";
      if (data.createdAt) {
        try {
          // Firestore Timestamp kontrolü
          if (data.createdAt.toDate) {
            formattedDate = data.createdAt.toDate().toLocaleString("tr-TR");
          } else if (data.createdAt.seconds) {
            // Timestamp object kontrolü
            const date = new Date(data.createdAt.seconds * 1000);
            formattedDate = date.toLocaleString("tr-TR");
          } else if (
            typeof data.createdAt === "string" ||
            typeof data.createdAt === "number"
          ) {
            // String veya number timestamp
            let timestamp = parseFloat(data.createdAt);

            console.log(
              "Debug - Chat createdAt orijinal timestamp:",
              timestamp
            );

            // Eğer timestamp sayısı 1e12'den küçükse saniye cinsinden, büyükse milisaniye cinsinden
            if (timestamp < 1e12) {
              timestamp = timestamp * 1000; // Saniyeyi milisaniyeye çevir
              console.log(
                "Debug - Chat createdAt saniye olarak algılandı, milisaniyeye çevrildi:",
                timestamp
              );
            } else {
              console.log(
                "Debug - Chat createdAt milisaniye olarak algılandı:",
                timestamp
              );
            }

            const date = new Date(timestamp);
            formattedDate = date.toLocaleString("tr-TR");

            console.log("Debug - Chat createdAt sonuç tarihi:", formattedDate);
          }
        } catch (error) {
          console.error("Tarih formatlanırken hata:", error);
        }
      }

      // Bu chat'teki egzersiz analizlerini say
      let exerciseAnalysisCount = 0;
      let exerciseTypes = [];

      try {
        // Bu chat'in mesajlarını al
        const messagesCollection = collection(doc.ref, "messages");
        const messagesSnapshot = await getDocs(messagesCollection);

        messagesSnapshot.docs.forEach((messageDoc) => {
          const messageData = messageDoc.data();
          // extra.exercise varsa ve boş değilse analiz var demektir
          if (
            messageData.extra &&
            messageData.extra.exercise &&
            messageData.extra.exercise.trim() !== "" &&
            messageData.extra.exercise !== "Egzersiz bulunamadı"
          ) {
            exerciseAnalysisCount++;
            // Egzersiz türlerini de topla (tekrar etmeyecek şekilde)
            const exerciseType = messageData.extra.exercise.trim();
            if (!exerciseTypes.includes(exerciseType)) {
              exerciseTypes.push(exerciseType);
            }
          }
        });
      } catch (error) {
        console.error(
          `Chat ${doc.id} analiz sayısı hesaplanırken hata:`,
          error
        );
      }

      return {
        id: doc.id,
        title: data.title || "Başlıksız Chat",
        createdAt: data.createdAt,
        formattedDate: formattedDate,
        exerciseAnalysisCount: exerciseAnalysisCount,
        exerciseTypes: exerciseTypes,
        exerciseAnalysisText:
          exerciseAnalysisCount > 0
            ? `${exerciseAnalysisCount} analiz (${exerciseTypes.join(", ")})`
            : "Egzersiz analizi yok",
        ...data,
      };
    });

    // Tüm chat'ler için analiz sayılarını bekle
    const chatHistory = await Promise.all(chatHistoryPromises);

    // Tarihe göre sırala (en yeni en üstte)
    chatHistory.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;

      try {
        let dateA, dateB;

        if (a.createdAt.toDate) {
          dateA = a.createdAt.toDate();
        } else if (a.createdAt.seconds) {
          dateA = new Date(a.createdAt.seconds * 1000);
        } else {
          dateA = new Date(a.createdAt);
        }

        if (b.createdAt.toDate) {
          dateB = b.createdAt.toDate();
        } else if (b.createdAt.seconds) {
          dateB = new Date(b.createdAt.seconds * 1000);
        } else {
          dateB = new Date(b.createdAt);
        }

        return dateB - dateA; // En yeni en üstte
      } catch (error) {
        console.error("Tarih karşılaştırılırken hata:", error);
        return 0;
      }
    });

    console.log(
      `Kullanıcı ${userId} chat geçmişi (${chatHistory.length} adet):`,
      chatHistory
    );
    return chatHistory;
  } catch (error) {
    console.error("Chat geçmişi alınırken hata:", error);
    return [];
  }
};

// Belirli bir chat'in mesajlarını getir
export const getChatMessages = async (userId, chatId) => {
  try {
    if (!userId || !chatId) {
      console.log("User ID veya Chat ID bulunamadı");
      return [];
    }

    console.log("Chat mesajları alınıyor:", { userId, chatId });

    // chats/{userId}/histories/{chatId}/messages yolu
    const chatDocRef = doc(db, "chats", userId, "histories", chatId);
    const messagesCollection = collection(chatDocRef, "messages");
    const messagesSnapshot = await getDocs(messagesCollection);

    const messages = messagesSnapshot.docs.map((doc) => {
      const data = doc.data();

      // Timestamp'ı tarihe çevir
      let formattedDate = "Tarih bulunamadı";
      if (data.ts) {
        try {
          // ts'nin saniye mi milisaniye mi olduğunu kontrol et
          let timestamp = data.ts;

          console.log("Debug - Orijinal timestamp:", timestamp);

          // Eğer timestamp sayısı 1e12'den küçükse saniye cinsinden, büyükse milisaniye cinsinden
          // 1e12 = 1,000,000,000,000 (1 trilyon) - 2001 yılı civarında saniye/milisaniye ayrımı için
          if (timestamp < 1e12) {
            timestamp = timestamp * 1000; // Saniyeyi milisaniyeye çevir
            console.log(
              "Debug - Saniye olarak algılandı, milisaniyeye çevrildi:",
              timestamp
            );
          } else {
            console.log("Debug - Milisaniye olarak algılandı:", timestamp);
          }

          const date = new Date(timestamp);
          formattedDate = date.toLocaleString("tr-TR");

          console.log("Debug - Sonuç tarihi:", formattedDate);
        } catch (error) {
          console.error("Mesaj tarihi formatlanırken hata:", error);
        }
      }

      return {
        id: doc.id,
        content: data.content || "İçerik bulunamadı",
        role: data.role || "Rol bulunamadı",
        exercise: data.extra?.exercise || "Egzersiz bulunamadı",
        ts: data.ts,
        formattedDate: formattedDate,
        extra: data.extra || {},
        ...data,
      };
    });

    // Tarihe göre sırala (en eski en üstte - sohbet akışı)
    messages.sort((a, b) => {
      if (!a.ts || !b.ts) return 0;
      return a.ts - b.ts; // En eski en üstte
    });

    console.log(
      `Chat ${chatId} mesajları (${messages.length} adet):`,
      messages
    );
    return messages;
  } catch (error) {
    console.error("Chat mesajları alınırken hata:", error);
    return [];
  }
};

// Kullanıcının chat istatistiklerini getir (filtrelenmiş)
export const getUserChatStatistics = async (userId, filterType = "all") => {
  try {
    if (!userId)
      return {
        totalChats: 0,
        totalMessages: 0,
        filteredChats: 0,
        filteredMessages: 0,
        chatList: [],
      };

    console.log("Chat istatistikleri alınıyor:", { userId, filterType });

    // Önce tüm chat'leri getUserChatHistory ile al (bu egzersiz sayılarını da hesaplar)
    const allChats = await getUserChatHistory(userId);

    // Toplam mesaj sayısını hesapla
    const totalMessages = allChats.reduce(
      (total, chat) => total + (chat.messageCount || 0),
      0
    );

    // Tarih filtresi için bugünün tarihini al
    const now = new Date();
    let startDate;

    switch (filterType) {
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
        startDate = null; // Tüm veriler
    }

    // Filtrelenmiş chat'leri bul
    let filteredChats = allChats;
    let filteredMessages = totalMessages;

    if (startDate) {
      filteredChats = allChats.filter((chat) => {
        if (chat.lastUpdated) {
          const chatDate = chat.lastUpdated.toDate
            ? chat.lastUpdated.toDate()
            : new Date(chat.lastUpdated);
          return chatDate >= startDate;
        } else if (chat.createdAt) {
          const chatDate = chat.createdAt.toDate
            ? chat.createdAt.toDate()
            : new Date(chat.createdAt);
          return chatDate >= startDate;
        }
        return false; // Tarih bilgisi yoksa dahil etme
      });

      // Filtrelenmiş mesaj sayısını hesapla
      filteredMessages = filteredChats.reduce(
        (total, chat) => total + (chat.messageCount || 0),
        0
      );
    }

    const statistics = {
      totalChats: allChats.length,
      totalMessages: totalMessages,
      filteredChats: filteredChats.length,
      filteredMessages: filteredMessages,
      chatList: filteredChats,
      filterType: filterType,
      filterStartDate: startDate,
    };

    console.log(`Kullanıcı ${userId} chat istatistikleri:`, statistics);
    return statistics;
  } catch (error) {
    console.error("Chat istatistikleri alınırken hata:", error);
    return {
      totalChats: 0,
      totalMessages: 0,
      filteredChats: 0,
      filteredMessages: 0,
      chatList: [],
    };
  }
};
