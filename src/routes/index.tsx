import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ProductCard, type Product } from "@/components/ProductCard";

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative w-full min-h-[450px] md:min-h-0 md:aspect-[1280/623] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://i.postimg.cc/T3w89btz/heroimage.png')",
          }}
        />
        <div className="relative z-10 w-full h-full flex flex-col justify-end items-center pb-[38px] px-6">
          <div className="max-w-2xl text-center flex flex-col items-center">

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <a
                href="#collection"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-xs md:text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 hover:translate-y-[-1px] active:translate-y-0"
              >
                Shop the collection
              </a>
              <a
                href="#collection"
                className="inline-flex items-center justify-center rounded-md border border-border bg-[var(--cream-soft)] px-5 py-2 text-xs md:text-sm font-medium text-foreground transition hover:bg-[var(--cream)] hover:translate-y-[-1px] active:translate-y-0"
              >
                Order your own
              </a>
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

      <footer className="border-t border-border bg-[var(--cream-soft)]">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} GiftWorldonline — Sculpting memories in 3D.
        </div>
      </footer>
    </div>
  );
}
