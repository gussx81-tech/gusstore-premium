import cineplusImage from "@/assets/cineplus.jpg";
import freefireImage from "@/assets/freefire-topup.jpg";
import netstreamImage from "@/assets/netstream.jpg";
import soundmaxImage from "@/assets/soundmax.jpg";
import {
  SUPER_ADMIN_ID,
  SUPER_ADMIN_PHONE,
  SUPER_ADMIN_PROVIDER_NAME,
  SUPER_ADMIN_USERNAME,
} from "@/lib/authStorage";
import type { Product } from "@/types/product";

const STORAGE_KEY = "gusstore_products_v1";
const ANNOUNCEMENT_STORAGE_KEY = "gusstore_announcement_v1";
const CATEGORIES_STORAGE_KEY = "gusstore_categories_v1";
const BASE_WHATSAPP_DOMAIN = "https://wa.me";
const DEFAULT_ANNOUNCEMENT = "🔥 Ofertas activas hoy: entrega rápida y soporte directo por WhatsApp";
const DEFAULT_CATEGORIES = ["Streaming", "Gaming", "Música"];

/**
 * Genera la URL de WhatsApp con mensaje personalizado según el dueño del producto.
 */
export const createWhatsAppUrl = (productName: string, productPrice: number, ownerPhone: string, ownerName: string) => {
  const safePhone = ownerPhone.replace(/\D/g, "") || SUPER_ADMIN_PHONE;
  
  // Identificamos si eres tú (Gusstore) o un socio
  const isMainAdmin = (ownerName === SUPER_ADMIN_PROVIDER_NAME || ownerName === "Guss81" || ownerName === "Gusstore");
  
  // Configuración del saludo
  const finalGreetingName = isMainAdmin ? "Gusstore" : ownerName;

  // Configuración de la referencia a la web (Tu web vs La web)
  const webReference = isMainAdmin ? "tu web Gus Store" : "la web Gus Store";

  const message = `Hola ${finalGreetingName}, vengo de ${webReference}. Quiero la cuenta de ${productName} de S/ ${productPrice.toFixed(2)}. ¿A dónde te Yapeo?`;
  
  return `${BASE_WHATSAPP_DOMAIN}/${safePhone}?text=${encodeURIComponent(message)}`;
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "NetStream Premium",
    price: 29,
    stock: "Disponible",
    category: "Streaming",
    whatsappUrl: "", 
    image: netstreamImage,
    ownerId: SUPER_ADMIN_ID,
    ownerUsername: SUPER_ADMIN_USERNAME,
    ownerName: SUPER_ADMIN_PROVIDER_NAME,
    ownerPhone: SUPER_ADMIN_PHONE,
  },
  {
    id: "2",
    name: "CinePlus Ultra",
    price: 35,
    stock: "Disponible",
    category: "Streaming",
    whatsappUrl: "",
    image: cineplusImage,
    ownerId: SUPER_ADMIN_ID,
    ownerUsername: SUPER_ADMIN_USERNAME,
    ownerName: SUPER_ADMIN_PROVIDER_NAME,
    ownerPhone: SUPER_ADMIN_PHONE,
  },
];

const normalizeCategories = (categories: string[]) => {
  const unique = Array.from(new Set(categories.map((category) => category.trim()).filter(Boolean)));
  return unique.length ? unique : DEFAULT_CATEGORIES;
};

export const loadCategories = (): string[] => {
  const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
  if (!raw) return DEFAULT_CATEGORIES;
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
  if (!raw) return DEFAULT_PRODUCTS;

  try {
    const parsed = JSON.parse(raw) as Product[];
    if (!parsed.length) return DEFAULT_PRODUCTS;

    const categories = loadCategories();
    const fallbackCategory = categories[0] || "Streaming";

    return parsed.map((product) => {
      const ownerId = product.ownerId || SUPER_ADMIN_ID;
      const ownerUsername = product.ownerUsername || SUPER_ADMIN_USERNAME;
      const ownerName = product.ownerName || SUPER_ADMIN_PROVIDER_NAME;
      const ownerPhone = product.ownerPhone || SUPER_ADMIN_PHONE;

      return {
        ...product,
        category: product.category?.trim() || fallbackCategory,
        ownerId,
        ownerUsername,
        ownerName,
        ownerPhone,
        ownerLogo: product.ownerLogo,
        // Aquí se genera el link con la nueva lógica de nombres y webReference
        whatsappUrl: createWhatsAppUrl(product.name, Number(product.price), ownerPhone, ownerName),
      };
    });
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
