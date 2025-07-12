import { db } from "./firebaseConfig.js";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

// Settings dokümanından API URL'i getir
export const getApiUrl = async () => {
  try {
    const settingsDoc = doc(db, "settings", "settings");
    const settingsSnapshot = await getDoc(settingsDoc);

    if (settingsSnapshot.exists()) {
      const data = settingsSnapshot.data();
      return data.api_url || null;
    } else {
      console.log("Settings dokümanı bulunamadı");
      return null;
    }
  } catch (error) {
    console.error("API URL getirilirken hata:", error);
    throw error;
  }
};

// API URL'i güncelle
export const updateApiUrl = async (newApiUrl) => {
  try {
    const settingsDoc = doc(db, "settings", "settings");

    // Önce dokümanın var olup olmadığını kontrol et
    const settingsSnapshot = await getDoc(settingsDoc);

    if (settingsSnapshot.exists()) {
      // Doküman varsa güncelle
      await updateDoc(settingsDoc, {
        api_url: newApiUrl,
        updatedAt: new Date(),
      });
    } else {
      // Doküman yoksa oluştur
      await setDoc(settingsDoc, {
        api_url: newApiUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log("API URL başarıyla güncellendi:", newApiUrl);
    return true;
  } catch (error) {
    console.error("API URL güncellenirken hata:", error);
    throw error;
  }
};

// Tüm settings bilgilerini getir (gelecekte başka ayarlar eklenebilir)
export const getAllSettings = async () => {
  try {
    const settingsDoc = doc(db, "settings", "settings");
    const settingsSnapshot = await getDoc(settingsDoc);

    if (settingsSnapshot.exists()) {
      return {
        id: settingsSnapshot.id,
        ...settingsSnapshot.data(),
      };
    } else {
      console.log("Settings dokümanı bulunamadı");
      return null;
    }
  } catch (error) {
    console.error("Settings getirilirken hata:", error);
    throw error;
  }
};

// Birden fazla setting alanını güncelle
export const updateSettings = async (settingsData) => {
  try {
    const settingsDoc = doc(db, "settings", "settings");

    // Önce dokümanın var olup olmadığını kontrol et
    const settingsSnapshot = await getDoc(settingsDoc);

    if (settingsSnapshot.exists()) {
      // Doküman varsa güncelle
      await updateDoc(settingsDoc, {
        ...settingsData,
        updatedAt: new Date(),
      });
    } else {
      // Doküman yoksa oluştur
      await setDoc(settingsDoc, {
        ...settingsData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log("Settings başarıyla güncellendi:", settingsData);
    return true;
  } catch (error) {
    console.error("Settings güncellenirken hata:", error);
    throw error;
  }
};

// Models dokümanından model bilgilerini getir
export const getModelsSettings = async () => {
  try {
    const modelsDoc = doc(db, "settings", "models");
    const modelsSnapshot = await getDoc(modelsDoc);

    if (modelsSnapshot.exists()) {
      const data = modelsSnapshot.data();
      return {
        availableModels: data.availableModels || [],
        base_model: data.base_model || null,
      };
    } else {
      console.log("Models dokümanı bulunamadı");
      return {
        availableModels: [],
        base_model: null,
      };
    }
  } catch (error) {
    console.error("Model bilgileri getirilirken hata:", error);
    throw error;
  }
};

// Base model'i getir
export const getBaseModel = async () => {
  try {
    const modelsDoc = doc(db, "settings", "models");
    const modelsSnapshot = await getDoc(modelsDoc);

    if (modelsSnapshot.exists()) {
      const data = modelsSnapshot.data();
      return data.base_model || null;
    } else {
      console.log("Models dokümanı bulunamadı");
      return null;
    }
  } catch (error) {
    console.error("Base model getirilirken hata:", error);
    throw error;
  }
};

// Available models'i getir
export const getAvailableModels = async () => {
  try {
    const modelsDoc = doc(db, "settings", "models");
    const modelsSnapshot = await getDoc(modelsDoc);

    if (modelsSnapshot.exists()) {
      const data = modelsSnapshot.data();
      return data.availableModels || [];
    } else {
      console.log("Models dokümanı bulunamadı");
      return [];
    }
  } catch (error) {
    console.error("Available models getirilirken hata:", error);
    throw error;
  }
};

// Base model'i güncelle
export const updateBaseModel = async (newBaseModel) => {
  try {
    const modelsDoc = doc(db, "settings", "models");

    // Önce dokümanın var olup olmadığını kontrol et
    const modelsSnapshot = await getDoc(modelsDoc);

    if (modelsSnapshot.exists()) {
      // Doküman varsa güncelle
      await updateDoc(modelsDoc, {
        base_model: newBaseModel,
        updatedAt: new Date(),
      });
    } else {
      // Doküman yoksa oluştur
      await setDoc(modelsDoc, {
        base_model: newBaseModel,
        availableModels: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log("Base model başarıyla güncellendi:", newBaseModel);
    return true;
  } catch (error) {
    console.error("Base model güncellenirken hata:", error);
    throw error;
  }
};

// Available models'i güncelle
export const updateAvailableModels = async (newAvailableModels) => {
  try {
    const modelsDoc = doc(db, "settings", "models");

    // Önce dokümanın var olup olmadığını kontrol et
    const modelsSnapshot = await getDoc(modelsDoc);

    if (modelsSnapshot.exists()) {
      // Doküman varsa güncelle
      await updateDoc(modelsDoc, {
        availableModels: newAvailableModels,
        updatedAt: new Date(),
      });
    } else {
      // Doküman yoksa oluştur
      await setDoc(modelsDoc, {
        availableModels: newAvailableModels,
        base_model: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log("Available models başarıyla güncellendi:", newAvailableModels);
    return true;
  } catch (error) {
    console.error("Available models güncellenirken hata:", error);
    throw error;
  }
};

// Hem base model hem available models'i birlikte güncelle
export const updateModelsSettings = async (baseModel, availableModels) => {
  try {
    const modelsDoc = doc(db, "settings", "models");

    // Önce dokümanın var olup olmadığını kontrol et
    const modelsSnapshot = await getDoc(modelsDoc);

    const updateData = {
      updatedAt: new Date(),
    };

    if (baseModel !== undefined) {
      updateData.base_model = baseModel;
    }

    if (availableModels !== undefined) {
      updateData.availableModels = availableModels;
    }

    if (modelsSnapshot.exists()) {
      // Doküman varsa güncelle
      await updateDoc(modelsDoc, updateData);
    } else {
      // Doküman yoksa oluştur
      await setDoc(modelsDoc, {
        base_model: baseModel || null,
        availableModels: availableModels || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log("Model settings başarıyla güncellendi:", {
      baseModel,
      availableModels,
    });
    return true;
  } catch (error) {
    console.error("Model settings güncellenirken hata:", error);
    throw error;
  }
};
