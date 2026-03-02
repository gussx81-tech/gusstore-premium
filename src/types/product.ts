export type ProductStock = "Disponible" | "Agotado";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: ProductStock;
  whatsappUrl: string;
  image: string;
}
