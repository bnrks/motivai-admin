import { db } from "./firebaseConfig.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

// Admin kullanıcı girişi için authentication
export const authenticateAdmin = async (username, password) => {
  try {
    if (!username || !password) {
      return {
        success: false,
        error: "Kullanıcı adı ve şifre gereklidir",
      };
    }

    console.log("Giriş denemesi:", username);

    // admin-panel collection altında kullanıcı adı ile aynı olan document'ı ara
    const adminDocRef = doc(db, "admin-panel", username);
    const adminDocSnapshot = await getDoc(adminDocRef);

    if (!adminDocSnapshot.exists()) {
      console.log("Kullanıcı bulunamadı:", username);
      return {
        success: false,
        error: "Kullanıcı bulunamadı",
      };
    }

    const adminData = adminDocSnapshot.data();
    console.log("Bulunan admin verisi:", {
      username: adminData.username,
      hasPassword: !!adminData.password,
    });

    // Şifre kontrolü
    if (adminData.password !== password) {
      console.log("Şifre eşleşmiyor");
      return {
        success: false,
        error: "Şifre hatalı",
      };
    }

    console.log("Giriş başarılı:", username);

    // Başarılı giriş
    return {
      success: true,
      user: {
        username: adminData.username || username,
        role: adminData.role || "admin",
        name: adminData.name || username,
        email: adminData.email || "",
        permissions: adminData.permissions || [],
      },
    };
  } catch (error) {
    console.error("Authentication hatası:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Admin kullanıcı bilgilerini getir
export const getAdminUser = async (username) => {
  try {
    const adminDocRef = doc(db, "admin-panel", username);
    const adminDocSnapshot = await getDoc(adminDocRef);

    if (adminDocSnapshot.exists()) {
      return {
        id: adminDocSnapshot.id,
        ...adminDocSnapshot.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Admin kullanıcı getirirken hata:", error);
    return null;
  }
};

// Tüm admin kullanıcıları listele (yönetim için)
export const getAllAdminUsers = async () => {
  try {
    const adminCollection = collection(db, "admin-panel");
    const adminSnapshot = await getDocs(adminCollection);

    const adminUsers = adminSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return adminUsers;
  } catch (error) {
    console.error("Admin kullanıcıları getirilirken hata:", error);
    return [];
  }
};
