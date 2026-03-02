import { Button } from "@/components/ui/button";
import { createWhatsAppUrl } from "@/lib/productsStorage";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const stockClasses =
    product.stock === "Disponible"
      ? "border-success/40 bg-success/20 text-success"
      : "border-destructive/40 bg-destructive/20 text-destructive";

  return (
    <article className="glass-card group overflow-hidden rounded-2xl p-3 transition-transform duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={product.image}
          alt={`Servicio ${product.name}`}
          loading="lazy"
          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="space-y-3 p-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">{product.name}</h3>
          <span className={`rounded-full border px-2 py-1 text-xs font-medium ${stockClasses}`}>{product.stock}</span>
        </div>

        <p className="text-xl font-bold text-primary">S/ {product.price.toFixed(2)}</p>

        <Button asChild className="w-full bg-gradient-brand text-primary-foreground shadow-neon transition-transform hover:scale-[1.02]">
          <a href={createWhatsAppUrl(product.name, product.price)} target="_blank" rel="noreferrer">
            Comprar por WhatsApp
          </a>
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;
