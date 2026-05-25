import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Package, List, ClipboardList, ArrowLeft, Upload, Loader2, Download, Image } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Panel — GiftWorldonline" },
      { name: "description", content: "Admin dashboard to manage products and orders." },
    ],
  }),
});

type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_4inch: number;
  price_6inch: number;
  price_8inch: number;
};

type OrderItem = {
  id: string;
  size: string;
  quantity: number;
  reference_image_path: string | null;
  products: {
    name: string;
  } | null;
};

type Order = {
  id: string;
  customer_name: string;
  phone_number: string;
  shipping_address: string;
  pincode: string;
  total_amount: number;
  status: string;
  created_at: string;
  custom_orders: OrderItem[];
};

function ReferenceImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUrl() {
      try {
        const { data, error } = await supabase.storage
          .from("custom-uploads")
          .createSignedUrl(path, 3600); // 1 hour expiry
        if (error) throw error;
        setUrl(data.signedUrl);
      } catch (err) {
        console.error("Error generating signed URL:", err);
      } finally {
        setLoading(false);
      }
    }
    getUrl();
  }, [path]);

  if (loading) return <span className="text-muted-foreground animate-pulse text-xs">Loading image...</span>;
  if (!url) return <span className="text-destructive text-xs">Failed to load image</span>;

  const downloadUrl = (() => {
    try {
      const u = new URL(url);
      const filename = path.split("/").pop() ?? "reference-image.jpg";
      u.searchParams.append("download", filename);
      return u.toString();
    } catch (e) {
      return url;
    }
  })();

  return (
    <div className="flex items-center gap-3 mt-2 bg-secondary/35 p-2 rounded-lg max-w-sm">
      <img src={url} alt="Reference" className="h-14 w-14 rounded object-cover border border-border" />
      <div className="flex flex-col gap-1 text-left">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium text-[11px] flex items-center gap-1"
        >
          View Full Image
        </a>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] gap-1 px-2 py-0.5"
          asChild
        >
          <a href={downloadUrl} download>
            <Download className="h-3 w-3" /> Download
          </a>
        </Button>
      </div>
    </div>
  );
}

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"products" | "add" | "orders">("products");

  // Form State
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [price4, setPrice4] = useState("");
  const [price6, setPrice6] = useState("");
  const [price8, setPrice8] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);

  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL || user?.email?.toLowerCase() === "admin@giftworldonline.com";

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error("Access denied. Please sign in first.");
        navigate({ to: "/auth" });
      } else if (!isAdmin) {
        toast.error("Access denied. You are not authorized as an admin.");
        navigate({ to: "/" });
      }
    }
  }, [user, authLoading, navigate, isAdmin]);

  // Fetch Products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user,
  });

  // Fetch Orders joined with custom_orders & product info
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, custom_orders(*, products(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Order[];
    },
    enabled: !!user,
  });

  // Delete Product Mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      // 1. Delete preview image from public product-images bucket if it exists in storage
      if (product.image_url && product.image_url.includes("product-images")) {
        const filename = product.image_url.split("/").pop();
        if (filename) {
          const { error: storageErr } = await supabase.storage
            .from("product-images")
            .remove([filename]);
          if (storageErr) {
            console.error("Failed to delete product image from storage:", storageErr);
          }
        }
      }

      // 2. Delete database record
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to delete product");
    },
  });

  // Delete Order Mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      // 1. Fetch custom orders to get their reference image paths
      const { data: items, error: fetchErr } = await supabase
        .from("custom_orders")
        .select("reference_image_path")
        .eq("order_id", id);
      if (fetchErr) throw fetchErr;

      // 2. Extract non-null reference image paths
      const paths = items
        ?.map((item) => item.reference_image_path)
        .filter((path): path is string => !!path) ?? [];

      // 3. Delete files from Supabase Storage custom-uploads bucket
      if (paths.length > 0) {
        const { error: storageErr } = await supabase.storage
          .from("custom-uploads")
          .remove(paths);
        if (storageErr) {
          console.error("Failed to delete files from storage:", storageErr);
          // Log but proceed with DB deletion so records are not stuck
        }
      }

      // 4. Delete associated custom orders first to avoid orphans
      const { error: customErr } = await supabase
        .from("custom_orders")
        .delete()
        .eq("order_id", id);
      if (customErr) throw customErr;

      // 5. Delete the order record
      const { error: orderErr } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);
      if (orderErr) throw orderErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to delete order");
    },
  });

  // Update Order Status Mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Update blocked by database RLS policy. Admin update permissions are required.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to update order status");
    },
  });

  // Add Product Submit
  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!prodName || !price4 || !price6 || !price8) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setAddingProduct(true);

    try {
      let uploadedUrl: string | null = null;

      // Upload image if file selected
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() ?? "jpg";
        const filename = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(filename, imageFile, { cacheControl: "3600", upsert: false });
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filename);
        uploadedUrl = urlData.publicUrl;
      }

      // Insert product into database
      const { error: insertErr } = await supabase.from("products").insert({
        name: prodName,
        description: prodDesc || null,
        image_url: uploadedUrl,
        price_4inch: parseFloat(price4),
        price_6inch: parseFloat(price6),
        price_8inch: parseFloat(price8),
      });
      if (insertErr) throw insertErr;

      toast.success("Product added successfully!");
      // Reset form
      setProdName("");
      setProdDesc("");
      setPrice4("");
      setPrice6("");
      setPrice8("");
      setImageFile(null);
      setActiveTab("products");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add product");
    } finally {
      setAddingProduct(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-serif text-2xl font-semibold text-primary">Admin Dashboard</span>
          </div>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Back to Shop
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          {/* Navigation Sidebar */}
          <aside className="flex flex-col gap-2">
            <Button
              variant={activeTab === "products" ? "default" : "ghost"}
              className="justify-start gap-2 font-serif text-base"
              onClick={() => setActiveTab("products")}
            >
              <Package className="h-5 w-5" />
              Manage Products
            </Button>
            <Button
              variant={activeTab === "add" ? "default" : "ghost"}
              className="justify-start gap-2 font-serif text-base"
              onClick={() => setActiveTab("add")}
            >
              <Plus className="h-5 w-5" />
              Add Product
            </Button>
            <Button
              variant={activeTab === "orders" ? "default" : "ghost"}
              className="justify-start gap-2 font-serif text-base"
              onClick={() => setActiveTab("orders")}
            >
              <ClipboardList className="h-5 w-5" />
              View Orders
            </Button>
          </aside>

          {/* Tab Contents */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            {/* Products Tab */}
            {activeTab === "products" && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-serif text-2xl text-foreground">Products List</h2>
                  <Button onClick={() => setActiveTab("add")} className="gap-2">
                    <Plus className="h-4 w-4" /> Add New
                  </Button>
                </div>

                {productsLoading ? (
                  <div className="flex py-12 justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : !products || products.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    No products found. Add one to get started!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-sm font-medium">
                          <th className="py-3 px-4">Image</th>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Prices (4" / 6" / 8")</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((prod) => (
                          <tr key={prod.id} className="border-b border-border/50 hover:bg-secondary/20">
                            <td className="py-3 px-4">
                              <div className="h-12 w-12 rounded bg-[var(--cream-soft)] overflow-hidden flex items-center justify-center">
                                {prod.image_url ? (
                                  <img src={prod.image_url} alt={prod.name} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="font-serif text-lg text-primary">{prod.name.charAt(0)}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium text-foreground">{prod.name}</td>
                            <td className="py-3 px-4 text-sm">
                              ₹{prod.price_4inch} / ₹{prod.price_6inch} / ₹{prod.price_8inch}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete "${prod.name}"?`)) {
                                    deleteProductMutation.mutate(prod);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Add Product Tab */}
            {activeTab === "add" && (
              <div>
                <h2 className="mb-6 font-serif text-2xl text-foreground">Add New Product</h2>
                <form onSubmit={handleAddProduct} className="space-y-5 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="prod-name">Product Name *</Label>
                    <Input
                      id="prod-name"
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="E.g. Custom Family Statue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prod-desc">Description</Label>
                    <textarea
                      id="prod-desc"
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      placeholder="Add product details..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price-4">Price (4 inch) *</Label>
                      <Input
                        id="price-4"
                        type="number"
                        required
                        min={0}
                        value={price4}
                        onChange={(e) => setPrice4(e.target.value)}
                        placeholder="₹"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price-6">Price (6 inch) *</Label>
                      <Input
                        id="price-6"
                        type="number"
                        required
                        min={0}
                        value={price6}
                        onChange={(e) => setPrice6(e.target.value)}
                        placeholder="₹"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price-8">Price (8 inch) *</Label>
                      <Input
                        id="price-8"
                        type="number"
                        required
                        min={0}
                        value={price8}
                        onChange={(e) => setPrice8(e.target.value)}
                        placeholder="₹"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Product Image</Label>
                    <label
                      htmlFor="prod-image"
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-sm text-muted-foreground transition hover:bg-muted/50"
                    >
                      <Upload className="h-6 w-6" />
                      {imageFile ? (
                        <span className="font-medium text-foreground">{imageFile.name}</span>
                      ) : (
                        <span>Upload product preview photo</span>
                      )}
                      <input
                        id="prod-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>

                  <Button type="submit" disabled={addingProduct} className="w-full gap-2">
                    {addingProduct && <Loader2 className="h-4 w-4 animate-spin" />}
                    Add Product
                  </Button>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h2 className="mb-6 font-serif text-2xl text-foreground">Customer Orders</h2>

                {ordersLoading ? (
                  <div className="flex py-12 justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No orders placed yet.</div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-lg border border-border/80 bg-card/30 p-5 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between border-b border-border/50 pb-3 gap-2">
                          <div className="flex flex-wrap items-center gap-6">
                            <div>
                              <span className="text-xs uppercase tracking-wider text-muted-foreground">Order ID</span>
                              <p className="font-mono text-sm text-foreground">{order.id}</p>
                            </div>
                            <div>
                              <span className="text-xs uppercase tracking-wider text-muted-foreground">Date Placed</span>
                              <p className="text-sm text-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Amount</span>
                              <p className="font-serif text-base font-semibold text-primary">₹{order.total_amount}</p>
                            </div>
                            <div>
                              <span className="text-xs uppercase tracking-wider text-muted-foreground">Status</span>
                              <div className="mt-1">
                                <Select
                                  value={order.status}
                                  onValueChange={(status) => {
                                    updateOrderStatusMutation.mutate({ id: order.id, status });
                                  }}
                                  disabled={
                                    updateOrderStatusMutation.isPending &&
                                    updateOrderStatusMutation.variables?.id === order.id
                                  }
                                >
                                  <SelectTrigger className="w-[130px] h-8 text-xs font-medium cursor-pointer">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the order from "${order.customer_name}"?`)) {
                                deleteOrderMutation.mutate(order.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 text-sm">
                          <div>
                            <h4 className="font-serif font-semibold text-foreground mb-1">Customer Info</h4>
                            <p><span className="text-muted-foreground">Name:</span> {order.customer_name}</p>
                            <p><span className="text-muted-foreground">Phone:</span> {order.phone_number}</p>
                          </div>
                          <div>
                            <h4 className="font-serif font-semibold text-foreground mb-1">Shipping Details</h4>
                            <p>{order.shipping_address}</p>
                            <p><span className="text-muted-foreground">Pincode:</span> {order.pincode}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-serif font-semibold text-sm text-foreground mb-2">Items Ordered</h4>
                          <ul className="divide-y divide-border/40 text-xs">
                            {order.custom_orders?.map((item) => (
                              <li key={item.id} className="py-3 flex flex-col gap-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-medium text-foreground">{item.products?.name ?? "Custom Statue"}</span>
                                    <span className="text-muted-foreground ml-2">({item.size.replace("inch", " inch")})</span>
                                  </div>
                                  <div className="text-muted-foreground">Qty: {item.quantity}</div>
                                </div>
                                {item.reference_image_path && (
                                  <ReferenceImage path={item.reference_image_path} />
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
