import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ProductCard, type Product } from "@/components/ProductCard";
import heroImage from "@/assets/hero.jpg";

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

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="space-y-6">
            <span className="inline-block rounded-full border border-border bg-card px-4 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Hand-finished · Made to order
            </span>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
              Tiny statues,<br />
              <span className="italic text-primary">big stories.</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Mini 3D printed figurines in 4, 6 and 8 inch sizes. Browse the
              collection or commission your own from a photo.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#collection"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Shop the collection
              </a>
              <a
                href="#collection"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
              >
                Order your own
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-[var(--gradient-warm)] blur-2xl opacity-60" />
            <img
              src={heroImage}
              alt="A collection of small 3D printed figurines on cream linen"
              width={1600}
              height={1024}
              className="relative aspect-[4/3] w-full rounded-3xl object-cover shadow-[var(--shadow-soft)]"
            />
          </div>
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-4xl tracking-tight text-foreground">
              The Collection
            </h2>
            <p className="mt-2 text-muted-foreground">
              Each piece sculpted, printed and finished by hand.
            </p>
          </div>
        </div>

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
