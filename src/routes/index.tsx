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

      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div
          className="absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at 20% 30%, var(--cream) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, var(--cream-soft) 0%, transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-20 text-center md:pt-20 md:pb-28">
          <h1 className="font-serif text-4xl tracking-[0.08em] text-primary md:text-6xl">
            PERSONALISED 3D FIGURINES
          </h1>
          <p className="mt-6 font-serif text-lg tracking-[0.3em] text-muted-foreground md:text-xl">
            WWW.STATUEMINI3D.COM
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="#collection"
              className="inline-flex items-center justify-center rounded-md bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Shop the collection
            </a>
            <a
              href="#collection"
              className="inline-flex items-center justify-center rounded-md border border-border bg-[var(--cream-soft)] px-7 py-3 text-sm font-medium text-foreground transition hover:bg-[var(--cream)]"
            >
              Order your own
            </a>
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products?.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} ClayCraft Studio — Crafted with care.
        </div>
      </footer>
    </div>
  );
}
