import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import type { Product } from "@/types/product";

interface StreamingCarouselProps {
  products: Product[];
}

const StreamingCarousel = ({ products }: StreamingCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const slides = useMemo(() => products.filter((product) => product.category === "Streaming"), [products]);

  useEffect(() => {
    if (!api || slides.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
        return;
      }

      api.scrollTo(0);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [api, slides.length]);

  if (!slides.length) {
    return null;
  }

  return (
    <section className="border-b border-border/60 bg-background/60 py-4">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">
        <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent>
            {slides.map((product) => (
              <CarouselItem key={product.id}>
                <article className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70">
                  <img src={product.image} alt={product.name} className="h-[280px] w-full object-cover sm:h-[360px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Streaming destacado</p>
                    <h2 className="font-display mt-1 text-3xl sm:text-4xl">{product.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">S/ {product.price.toFixed(2)} · {product.stock}</p>
                    <Button asChild className="mt-4 bg-gradient-brand text-primary-foreground shadow-neon">
                      <a href={product.whatsappUrl} target="_blank" rel="noreferrer">
                        Comprar por WhatsApp
                      </a>
                    </Button>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default StreamingCarousel;
