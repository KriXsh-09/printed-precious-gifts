import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { SearchX } from "lucide-react";

type CatalogSearch = {
  q?: string;
};

export const Route = createFileRoute("/catalog")({
  component: CatalogPage,
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Catalog — GiftWorldonline" },
      {
        name: "description",
        content:
          "Browse our full collection of custom 3D printed statues. Filter by name and order your favourite piece.",
      },
    ],
  }),
});

function CatalogPage() {
  const { q } = useSearch({ from: "/catalog" });

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

  const filtered = q
    ? products?.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()),
      )
    : products;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page heading */}
      <section className="mx-auto max-w-7xl px-6 pt-10 pb-4">
        <h1 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl">
          Our Catalog
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {q ? (
            <>
              Showing results for{" "}
              <span className="font-semibold text-foreground">"{q}"</span>
            </>
          ) : (
            "Browse our full collection of customisable 3D printed gifts."
          )}
        </p>
      </section>

      {/* Product grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-4">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <SearchX className="h-12 w-12 text-muted-foreground/60" />
            <h2 className="mt-4 font-serif text-xl text-foreground">
              No products found
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {q
                ? `We couldn't find any products matching "${q}". Try a different search term.`
                : "No products are available at the moment. Check back soon!"}
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
