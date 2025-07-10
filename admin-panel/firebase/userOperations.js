import { db } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

// Tüm kullanıcıları getir
export const getAllUsers = async () => {
  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return usersList;
  } catch (error) {
    console.error("Kullanıcılar getirilirken hata:", error);
    throw error;
  }
};

// Belirli bir kullanıcıyı ID ile getir
export const getUserById = async (userId) => {
  try {
    const userDoc = doc(db, "users", userId);
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      return {
        id: userSnapshot.id,
        ...userSnapshot.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Kullanıcı getirilirken hata:", error);
    throw error;
  }
};

// Aktif kullanıcıları getir
export const getActiveUsers = async () => {
  try {
    const usersCollection = collection(db, "users");
    const activeUsersQuery = query(
      usersCollection,
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
    const usersSnapshot = await getDocs(activeUsersQuery);
    const usersList = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return usersList;
  } catch (error) {
    console.error("Aktif kullanıcılar getirilirken hata:", error);
    throw error;
  }
};

// Belirli sayıda kullanıcıyı getir (sayfalama için)
export const getUsersWithLimit = async (limitCount = 10) => {
  try {
    const usersCollection = collection(db, "users");
    const limitedUsersQuery = query(
      usersCollection,
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const usersSnapshot = await getDocs(limitedUsersQuery);
    const usersList = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return usersList;
  } catch (error) {
    console.error("Sınırlı kullanıcılar getirilirken hata:", error);
    throw error;
  }
};

// Email ile kullanıcı ara
export const getUserByEmail = async (email) => {
  try {
    const usersCollection = collection(db, "users");
    const emailQuery = query(usersCollection, where("email", "==", email));
    const usersSnapshot = await getDocs(emailQuery);

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Email ile kullanıcı aranırken hata:", error);
    throw error;
  }
};
