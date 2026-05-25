import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Your cart — GiftWorldonline" },
      { name: "description", content: "Review your custom statue orders before checkout." },
    ],
  }),
});

function CartPage() {
  const { items, removeItem, total, clear } = useCart();
  const { user } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  async function handleCheckoutSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to complete checkout.");
      return;
    }
    setCheckoutLoading(true);
    try {
      // 1. Insert order record into database
      const { data: newOrder, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: name,
          phone_number: phone,
          shipping_address: address,
          pincode: pincode,
          total_amount: total,
          status: "pending",
        })
        .select("id")
        .single();
      if (orderErr) throw orderErr;

      // 2. Link custom orders to this order and update status
      const dbIds = items.map((i) => i.dbId).filter((id): id is string => !!id);
      if (dbIds.length > 0) {
        const { error: updateErr } = await supabase
          .from("custom_orders")
          .update({
            order_id: newOrder.id,
            status: "ordered",
          })
          .in("id", dbIds);
        if (updateErr) throw updateErr;
      }

      // 3. Format WhatsApp message
      const itemsList = items
        .map(
          (item, index) =>
            `${index + 1}. ${item.name} - Size: ${item.size.replace("inch", " inch")} - Qty: ${item.quantity} - Price: ₹${(item.price * item.quantity).toFixed(2)}`
        )
        .join("\n");

      const message = `Hello GiftWorld, I would like to place an order!

*Order Summary:*
- Order ID: ${newOrder.id}
- Customer Name: ${name}
- Phone Number: ${phone}
- Shipping Address: ${address}
- Pincode: ${pincode}

*Items Ordered:*
${itemsList}

*Total Amount:* ₹${total.toFixed(2)}

Please confirm the order details. Thank you!`;

      // 4. Clear the cart locally
      clear();
      setCheckoutOpen(false);
      setName("");
      setPhone("");
      setAddress("");
      setPincode("");
      toast.success("Order registered! Redirecting to WhatsApp...");

      // 5. Redirect to WhatsApp
      const whatsappNumber = "919334680454"; 
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, "_blank");
    } catch (err: any) {
      toast.error(err.message ?? "Checkout failed. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }

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
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={async () => {
                      if (item.dbId) {
                        const { error } = await supabase
                          .from("custom_orders")
                          .delete()
                          .eq("id", item.dbId);
                        if (error) {
                          console.error("Failed to delete custom order:", error);
                        }
                      }
                      removeItem(item.id);
                    }}
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
                ₹{total.toFixed(2)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                className="flex-1"
                onClick={() => {
                  if (!user) {
                    toast.error("Please sign in to place an order.");
                    return;
                  }
                  setCheckoutOpen(true);
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

      <Footer />

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Shipping Details</DialogTitle>
            <DialogDescription>
              Provide your delivery details to complete your order on WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="E.g. +91 99999 99999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Input
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House No, Street, Landmark, City, State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                required
                pattern="[0-9]{6}"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="6-digit pincode"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-secondary/60 px-4 py-3">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="font-serif text-xl font-semibold text-primary">
                ₹{total.toFixed(2)}
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={checkoutLoading} className="w-full">
                {checkoutLoading ? "Processing..." : "Confirm & Pay on WhatsApp"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}