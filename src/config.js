const CONFIG_KEY = "modo-gym-config";
const PHOTOS_KEY = "modo-gym-photos";

export const defaultConfig = {
  whatsapp: "0998837540",
  whatsappIntl: "593998837540",
  instagram: "modo.gym",
  address: "Av. Principal 1234, Quito",
};

export function getConfig() {
  try {
    return { ...defaultConfig, ...JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}") };
  } catch {
    return { ...defaultConfig };
  }
}

export function saveConfig(cfg) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}

export function getUserPhotos() {
  try {
    return JSON.parse(localStorage.getItem(PHOTOS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveUserPhotos(photos) {
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
}

export function waLink(cfg) {
  const num = (cfg.whatsappIntl || "").replace(/\D/g, "");
  return num ? `https://wa.me/${num}` : "https://wa.me/";
}

export function igLink(cfg) {
  return `https://instagram.com/${cfg.instagram}`;
}
