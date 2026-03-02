import { useEffect, useMemo, useState } from "react";
import HeroSection from "@/components/store/HeroSection";
import ProductCard from "@/components/store/ProductCard";
import { loadProducts } from "@/lib/productsStorage";
import type { Product } from "@/types/product";

const Index = () => {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());

  useEffect(() => {
    const syncProducts = () => setProducts(loadProducts());
    window.addEventListener("storage", syncProducts);
    window.addEventListener("focus", syncProducts);

    return () => {
      window.removeEventListener("storage", syncProducts);
      window.removeEventListener("focus", syncProducts);
    };
  }, []);

  useEffect(() => {
    document.title = "Gusstore.lat | Entretenimiento sin límites";

    const description = "Streaming, recargas y suscripciones premium en Gusstore.lat. Compra rápida por WhatsApp con stock actualizado.";
    let metaDescription = document.querySelector("meta[name='description']");

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute("content", description);

    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", window.location.origin);
  }, []);

  const availableProducts = useMemo(() => products.filter((product) => product.stock === "Disponible").length, [products]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />

      <main id="catalogo" className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-14 sm:px-6 lg:px-10">
        <section className="mb-7 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Catálogo</p>
            <h2 className="font-display text-3xl">Servicios destacados</h2>
          </div>
          <p className="text-sm text-muted-foreground">{availableProducts} disponibles</p>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </main>
    </div>
  );
};

export default Index;
