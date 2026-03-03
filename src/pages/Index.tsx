import { useEffect, useMemo, useState } from "react";
import HeroSection from "@/components/store/HeroSection";
import ProductCard from "@/components/store/ProductCard";
import { loadAnnouncement, loadCategories, loadProducts } from "@/lib/productsStorage";
import type { Product } from "@/types/product";

const ALL_FILTER = "Todos";
const CATEGORY_ICONS: Record<string, string> = {
  Todos: "✨",
  Streaming: "🎬",
  Juegos: "🎮",
  Combos: "🧩",
};

const Index = () => {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [announcement, setAnnouncement] = useState(() => loadAnnouncement());
  const [categories, setCategories] = useState<string[]>(() => loadCategories());
  const [activeCategory, setActiveCategory] = useState(ALL_FILTER);

  useEffect(() => {
    const syncData = () => {
      setProducts(loadProducts());
      setAnnouncement(loadAnnouncement());
      setCategories(loadCategories());
    };

    window.addEventListener("storage", syncData);
    window.addEventListener("focus", syncData);

    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("focus", syncData);
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

  const filteredProducts = useMemo(() => {
    if (activeCategory === ALL_FILTER) {
      return products;
    }

    return products.filter((product) => product.category === activeCategory);
  }, [products, activeCategory]);

  const availableProducts = useMemo(
    () => filteredProducts.filter((product) => product.stock === "Disponible").length,
    [filteredProducts],
  );

  const categoryFilters = useMemo(() => [ALL_FILTER, ...categories], [categories]);

  const categoryImageMap = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((product) => {
      if (!map.has(product.category) && product.image) {
        map.set(product.category, product.image);
      }
    });
    return map;
  }, [products]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 bg-card/70 py-2">
        <div className="mx-auto w-full max-w-6xl px-4 text-center text-sm font-medium text-foreground sm:px-6 lg:px-10">
          {announcement}
        </div>
      </section>

      <HeroSection />

      <main id="catalogo" className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-10">
        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {categoryFilters.map((category) => {
            const isActive = activeCategory === category;
            const categoryImage = categoryImageMap.get(category);

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`group relative aspect-square overflow-hidden rounded-2xl border text-left transition-all ${
                  isActive
                    ? "border-primary shadow-neon ring-1 ring-primary/50"
                    : "border-border bg-card/70 hover:border-primary/40"
                }`}
              >
                {categoryImage ? (
                  <>
                    <img src={categoryImage} alt={category} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-hero-overlay" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-card/80" />
                )}

                <div className="relative flex h-full flex-col justify-between p-3">
                  <span className="text-lg" aria-hidden="true">
                    {CATEGORY_ICONS[category] || "🏷️"}
                  </span>
                  <span className="font-medium text-sm text-foreground">{category}</span>
                </div>
              </button>
            );
          })}
        </section>

        <section className="mb-7 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Catálogo</p>
            <h2 className="font-display text-3xl">Servicios destacados</h2>
          </div>
          <p className="text-sm text-muted-foreground">{availableProducts} disponibles</p>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </main>
    </div>
  );
};

export default Index;


