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
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// Tüm spor salonlarını getir
export const getAllGyms = async () => {
  try {
    const gymsCollection = collection(db, "gyms");
    const gymsSnapshot = await getDocs(gymsCollection);
    const gymsList = gymsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return gymsList;
  } catch (error) {
    console.error("Spor salonları getirilirken hata:", error);
    throw error;
  }
};

// Belirli bir spor salonunu ID ile getir
export const getGymById = async (gymId) => {
  try {
    const gymDoc = doc(db, "gyms", gymId);
    const gymSnapshot = await getDoc(gymDoc);

    if (gymSnapshot.exists()) {
      return {
        id: gymSnapshot.id,
        ...gymSnapshot.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Spor salonu getirilirken hata:", error);
    throw error;
  }
};

// Aktif spor salonlarını getir
export const getActiveGyms = async () => {
  try {
    const gymsCollection = collection(db, "gyms");
    const activeGymsQuery = query(
      gymsCollection,
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
    const gymsSnapshot = await getDocs(activeGymsQuery);
    const gymsList = gymsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return gymsList;
  } catch (error) {
    console.error("Aktif spor salonları getirilirken hata:", error);
    throw error;
  }
};

// Belirli sayıda spor salonunu getir (sayfalama için)
export const getGymsWithLimit = async (limitCount = 10) => {
  try {
    const gymsCollection = collection(db, "gyms");
    const limitedGymsQuery = query(
      gymsCollection,
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const gymsSnapshot = await getDocs(limitedGymsQuery);
    const gymsList = gymsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return gymsList;
  } catch (error) {
    console.error("Sınırlı spor salonları getirilirken hata:", error);
    throw error;
  }
};

// Şehre göre spor salonlarını getir
export const getGymsByCity = async (city) => {
  try {
    const gymsCollection = collection(db, "gyms");
    const cityQuery = query(
      gymsCollection,
      where("city", "==", city),
      orderBy("name")
    );
    const gymsSnapshot = await getDocs(cityQuery);
    const gymsList = gymsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return gymsList;
  } catch (error) {
    console.error("Şehre göre spor salonları getirilirken hata:", error);
    throw error;
  }
};

// İsme göre spor salonu ara
export const searchGymsByName = async (name) => {
  try {
    const gymsCollection = collection(db, "gyms");
    const nameQuery = query(
      gymsCollection,
      where("name", ">=", name),
      where("name", "<=", name + "\uf8ff"),
      orderBy("name")
    );
    const gymsSnapshot = await getDocs(nameQuery);
    const gymsList = gymsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return gymsList;
  } catch (error) {
    console.error("İsme göre spor salonu aranırken hata:", error);
    throw error;
  }
};

// Yeni spor salonu ekle
export const addGym = async (gymData) => {
  try {
    const gymsCollection = collection(db, "gyms");
    const docRef = await addDoc(gymsCollection, {
      ...gymData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Spor salonu eklenirken hata:", error);
    throw error;
  }
};

// Spor salonu güncelle
export const updateGym = async (gymId, gymData) => {
  try {
    const gymDoc = doc(db, "gyms", gymId);
    await updateDoc(gymDoc, {
      ...gymData,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Spor salonu güncellenirken hata:", error);
    throw error;
  }
};

// Spor salonu sil
export const deleteGym = async (gymId) => {
  try {
    const gymDoc = doc(db, "gyms", gymId);
    await deleteDoc(gymDoc);
    return true;
  } catch (error) {
    console.error("Spor salonu silinirken hata:", error);
    throw error;
  }
};
