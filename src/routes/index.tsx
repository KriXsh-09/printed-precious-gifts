import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const BANNER_IMAGES = [
  "https://i.postimg.cc/T3w89btz/heroimage.png",
  "https://i.postimg.cc/NM1jD2gv/Chat-GPT-Image-May-25-2026-11-50-09-AM.png",
];

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => {
      api.off("select", onSelect);
      clearInterval(interval);
    };
  }, [api]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="mx-auto max-w-7xl px-6 pt-6">
        <div className="relative border-2 border-border/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
            <CarouselContent className="-ml-0">
              {BANNER_IMAGES.map((imgUrl, index) => (
                <CarouselItem key={index} className="pl-0 relative w-full aspect-[4/3] md:aspect-[1280/623]">
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url('${imgUrl}')`,
                    }}
                  />
                  {/* Bottom gradient overlay to blend images and make buttons stand out */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Vignette / Inner Shadow overlay to soften the banner borders */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.15)] z-10" />

          {/* Overlay Content (fixed on top of slider) */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center pb-[30px] px-6 pointer-events-none gap-3">
            {/* Dots */}
            <div className="flex justify-center gap-2 pointer-events-auto">
              {BANNER_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === index ? "w-6 bg-primary" : "w-2 bg-primary/40 hover:bg-primary/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="max-w-2xl text-center flex flex-col items-center pointer-events-auto">
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/catalog"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-xs md:text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 hover:translate-y-[-1px] active:translate-y-0"
                >
                  Shop the collection
                </Link>
                <a
                  href="#collection"
                  className="inline-flex items-center justify-center rounded-md border border-border bg-[var(--cream-soft)] px-5 py-2 text-xs md:text-sm font-medium text-foreground transition hover:bg-[var(--cream)] hover:translate-y-[-1px] active:translate-y-0"
                >
                  Order your own
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover heading */}
      <section id="collection" className="mx-auto max-w-7xl px-6 pb-6 pt-4">
        <h2 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl">
          Discover the Perfect Customized Products for Any Occasion
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">100% Customisable</p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-6">

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products?.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
