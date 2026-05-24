import { useState } from "react";
import { Upload, ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart";

type Product = {
  id: string;
  name: string;
  price_4inch: number;
  price_6inch: number;
  price_8inch: number;
};

type Size = "4inch" | "6inch" | "8inch";

export function CustomOrderModal({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product;
}) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState<Size>("4inch");
  const [quantity, setQuantity] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const priceFor = (s: Size) =>
    s === "4inch" ? product.price_4inch : s === "6inch" ? product.price_6inch : product.price_8inch;

  const unitPrice = priceFor(size);

  async function handleAddToCart() {
    if (!user) {
      toast.error("Please sign in to place a custom order");
      onOpenChange(false);
      navigate({ to: "/auth" });
      return;
    }
    if (!file) {
      toast.error("Please upload a reference image");
      return;
    }
    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("custom-uploads")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const { data: orderData, error: orderErr } = await supabase
        .from("custom_orders")
        .insert({
          user_id: user.id,
          product_id: product.id,
          size,
          quantity,
          reference_image_path: path,
        })
        .select("id")
        .single();
      if (orderErr) throw orderErr;

      addItem({
        productId: product.id,
        name: `${product.name} (custom)`,
        size,
        quantity,
        price: unitPrice,
        custom: true,
        referencePath: path,
        dbId: orderData.id,
      });
      toast.success("Custom order added to your cart");
      onOpenChange(false);
      setFile(null);
      setQuantity(1);
      setSize("4inch");
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Order your own</DialogTitle>
          <DialogDescription>
            Customize {product.name} — pick a size, share your reference, and we'll sculpt it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Size</Label>
            <Select value={size} onValueChange={(v) => setSize(v as Size)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4inch">4 inch — ₹{product.price_4inch}</SelectItem>
                <SelectItem value="6inch">6 inch — ₹{product.price_6inch}</SelectItem>
                <SelectItem value="8inch">8 inch — ₹{product.price_8inch}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref-image">Reference image</Label>
            <label
              htmlFor="ref-image"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-4 py-6 text-sm text-muted-foreground transition hover:bg-muted"
            >
              <Upload className="h-5 w-5" />
              {file ? (
                <span className="font-medium text-foreground">{file.name}</span>
              ) : (
                <span>Click to upload a photo</span>
              )}
              <input
                id="ref-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qty">Quantity</Label>
            <Input
              id="qty"
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-secondary/60 px-4 py-3">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-serif text-xl font-semibold text-primary">
              ₹{(unitPrice * quantity).toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleAddToCart} disabled={submitting} className="w-full">
            <ShoppingBag className="mr-2 h-4 w-4" />
            {submitting ? "Adding…" : "Add to cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}