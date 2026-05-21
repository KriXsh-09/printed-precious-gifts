import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomOrderModal } from "./CustomOrderModal";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_4inch: number;
  price_6inch: number;
  price_8inch: number;
};

export function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-[var(--gradient-warm)]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-serif text-5xl text-primary/30">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-serif text-xl font-semibold text-foreground">{product.name}</h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
          <span className="text-sm text-muted-foreground">From</span>
          <span className="font-serif text-lg font-semibold text-primary">
            ${product.price_4inch}
          </span>
        </div>

        <Button onClick={() => setOpen(true)} variant="default" className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          Order your own
        </Button>
      </div>

      <CustomOrderModal open={open} onOpenChange={setOpen} product={product} />
    </article>
  );
}