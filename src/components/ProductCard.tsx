import { useState } from "react";
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
    <article className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-sm bg-[var(--cream-soft)]">
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

      <div className="flex flex-1 flex-col gap-3 pt-4">
        <h3 className="font-serif text-base text-foreground line-clamp-2">{product.name}</h3>
        <p className="font-serif text-base text-foreground">
          From <span className="font-semibold">${product.price_4inch.toFixed(2)}</span>
        </p>
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="w-full rounded-sm border-foreground/40 bg-transparent font-serif text-base hover:bg-[var(--cream)]"
        >
          Order your own
        </Button>
      </div>

      <CustomOrderModal open={open} onOpenChange={setOpen} product={product} />
    </article>
  );
}