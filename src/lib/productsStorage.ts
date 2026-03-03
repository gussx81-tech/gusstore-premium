import cineplusImage from "@/assets/cineplus.jpg";
import freefireImage from "@/assets/freefire-topup.jpg";
import netstreamImage from "@/assets/netstream.jpg";
import soundmaxImage from "@/assets/soundmax.jpg";
import type { Product } from "@/types/product";

const STORAGE_KEY = "gusstore_products_v1";
const ANNOUNCEMENT_STORAGE_KEY = "gusstore_announcement_v1";
const CATEGORIES_STORAGE_KEY = "gusstore_categories_v1";
const BASE_WHATSAPP_DOMAIN = "https://wa.me/51928862832?text=";
const DEFAULT_ANNOUNCEMENT = "🔥 Ofertas activas hoy: entrega rápida y soporte directo por WhatsApp";
const DEFAULT_CATEGORIES = ["Streaming", "Gaming", "Música"];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "NetStream Premium",
    price: 29,
    stock: "Disponible",
    category: "Streaming",
    whatsappUrl: `${BASE_WHATSAPP_DOMAIN}${encodeURIComponent("NetStream Premium")}`,
    image: netstreamImage,
  },
  {
    id: "2",
    name: "CinePlus Ultra",
    price: 35,
    stock: "Disponible",
    category: "Streaming",
    whatsappUrl: `${BASE_WHATSAPP_DOMAIN}${encodeURIComponent("CinePlus Ultra")}`,
    image: cineplusImage,
  },
  {
    id: "3",
    name: "Recarga Free Fire",
    price: 15,
    stock: "Agotado",
    category: "Gaming",
    whatsappUrl: `${BASE_WHATSAPP_DOMAIN}${encodeURIComponent("Recarga Free Fire")}`,
    image: freefireImage,
  },
  {
    id: "4",
    name: "SoundMax Pro",
    price: 19,
    stock: "Disponible",
    category: "Música",
    whatsappUrl: `${BASE_WHATSAPP_DOMAIN}${encodeURIComponent("SoundMax Pro")}`,
    image: soundmaxImage,
  },
];

export const createWhatsAppUrl = (productName: string, productPrice: number) => {
  const message = `Hola Gus, vengo de tu web Gus Store. Quiero la cuenta de ${productName} de S/ ${productPrice}. ¿A dónde te Yapeo?`;
  return `${BASE_WHATSAPP_DOMAIN}${encodeURIComponent(message)}`;
};

const normalizeCategories = (categories: string[]) => {
  const unique = Array.from(new Set(categories.map((category) => category.trim()).filter(Boolean)));
  return unique.length ? unique : DEFAULT_CATEGORIES;
};

export const loadCategories = (): string[] => {
  const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_CATEGORIES;
  }

  try {
    return normalizeCategories(JSON.parse(raw) as string[]);
  } catch {
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = (categories: string[]) => {
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(normalizeCategories(categories)));
};

export const loadProducts = (): Product[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_PRODUCTS;
  }

  try {
    const parsed = JSON.parse(raw) as Product[];
    if (!parsed.length) {
      return DEFAULT_PRODUCTS;
    }

    const categories = loadCategories();
    const fallbackCategory = categories[0] || "Streaming";

    return parsed.map((product) => ({
      ...product,
      category: product.category?.trim() || fallbackCategory,
      whatsappUrl: product.whatsappUrl || createWhatsAppUrl(product.name, product.price),
    }));
  } catch {
    return DEFAULT_PRODUCTS;
  }
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const loadAnnouncement = (): string => {
  return localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) || DEFAULT_ANNOUNCEMENT;
};

export const saveAnnouncement = (announcement: string) => {
  localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, announcement.trim() || DEFAULT_ANNOUNCEMENT);
};

