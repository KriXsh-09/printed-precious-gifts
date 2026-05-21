import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Your cart — ClayCraft Studio" },
      { name: "description", content: "Review your custom statue orders before checkout." },
    ],
  }),
});

function CartPage() {
  const { items, removeItem, total, clear } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
            <Link to="/">
              <Button className="mt-6">Browse the collection</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <div>
                  <p className="font-serif text-lg text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.size.replace("inch", " inch")} · Qty {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-serif text-lg font-semibold text-primary">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-secondary/60 px-6 py-5">
              <span className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Total
              </span>
              <span className="font-serif text-3xl font-semibold text-primary">
                ${total.toFixed(2)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success("Order placed! We'll be in touch soon.");
                  clear();
                }}
              >
                Checkout
              </Button>
              <Button variant="ghost" onClick={clear}>
                Clear cart
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}