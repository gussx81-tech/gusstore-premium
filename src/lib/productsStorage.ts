import cineplusImage from "@/assets/cineplus.jpg";
import freefireImage from "@/assets/freefire-topup.jpg";
import netstreamImage from "@/assets/netstream.jpg";
import soundmaxImage from "@/assets/soundmax.jpg";
import type { Product } from "@/types/product";

const STORAGE_KEY = "gusstore_products_v1";
const BASE_WHATSAPP_DOMAIN = "https://codesperu.lat/pay?item=";

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "NetStream Premium",
    price: 29,
    stock: "Disponible",
    whatsappUrl: `${BASE_WHATSAPP_DOMAIN}${encodeURIComponent("NetStream Premium")}`,
    image: netstreamImage,
  },
  {
    id: "2",
    name: "CinePlus Ultra",
    price: 35,
    stock: "Disponible",
    whatsappUrl: `${BASE_WHATSAPP_DOMAIN}${encodeURIComponent("CinePlus Ultra")}`,
    image: cineplusImage,
  },
  {
    id: "3",
    name: "Recarga Free Fire",
    price: 15,
    stock: "Agotado",
    whatsappUrl: `${BASE_WHATSAPP_DOMAIN}${encodeURIComponent("Recarga Free Fire")}`,
    image: freefireImage,
  },
  {
    id: "4",
    name: "SoundMax Pro",
    price: 19,
    stock: "Disponible",
    whatsappUrl: `${BASE_WHATSAPP_DOMAIN}${encodeURIComponent("SoundMax Pro")}`,
    image: soundmaxImage,
  },
];

export const createWhatsAppUrl = (productName: string) =>
  `${BASE_WHATSAPP_DOMAIN}${encodeURIComponent(productName.trim())}`;

export const loadProducts = (): Product[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_PRODUCTS;
  }

  try {
    const parsed = JSON.parse(raw) as Product[];
    return parsed.length ? parsed : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};
