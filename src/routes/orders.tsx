import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth-context";
import { Package, Clock, CheckCircle2, Truck, PackageX, LogIn } from "lucide-react";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [
      { title: "My Orders — GiftWorldonline" },
      {
        name: "description",
        content: "View your order history and track the status of your custom 3D printed statues.",
      },
    ],
  }),
});

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  phone_number: string;
  shipping_address: string;
  pincode: string;
  total_amount: number;
  status: string;
};

type CustomOrderItem = {
  id: string;
  size: string;
  quantity: number;
  status: string;
  product: {
    name: string;
    image_url: string | null;
  } | null;
};

function statusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "confirmed":
    case "processing":
      return <Package className="h-4 w-4 text-blue-500" />;
    case "shipped":
      return <Truck className="h-4 w-4 text-indigo-500" />;
    case "delivered":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "cancelled":
      return <PackageX className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function statusBadge(status: string) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize";
  switch (status.toLowerCase()) {
    case "pending":
      return `${base} bg-amber-50 text-amber-700 ring-1 ring-amber-200`;
    case "confirmed":
    case "processing":
      return `${base} bg-blue-50 text-blue-700 ring-1 ring-blue-200`;
    case "shipped":
      return `${base} bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200`;
    case "delivered":
      return `${base} bg-green-50 text-green-700 ring-1 ring-green-200`;
    case "cancelled":
      return `${base} bg-red-50 text-red-700 ring-1 ring-red-200`;
    default:
      return `${base} bg-muted text-muted-foreground`;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OrdersPage() {
  const { user, loading: authLoading } = useAuth();

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  // Fetch custom_order items linked to each order
  const orderIds = orders?.map((o) => o.id) ?? [];
  const { data: customItems } = useQuery({
    queryKey: ["my-order-items", orderIds],
    enabled: orderIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_orders")
        .select("id, size, quantity, status, order_id, product:products(name, image_url)")
        .in("order_id", orderIds);
      if (error) throw error;
      return data as (CustomOrderItem & { order_id: string })[];
    },
  });

  const itemsByOrder = (orderId: string) =>
    customItems?.filter((i) => i.order_id === orderId) ?? [];

  // Not signed in
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <LogIn className="h-12 w-12 text-muted-foreground/60" />
          <h1 className="mt-4 font-serif text-2xl text-foreground">
            Sign in to view your orders
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need to be signed in to see your order history.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const totalItems = orders
    ? orders.reduce((sum, _o, idx) => {
        const items = itemsByOrder(orders[idx].id);
        return sum + items.reduce((s, i) => s + i.quantity, 0);
      }, 0)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl">
              My Orders
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {orders && orders.length > 0
                ? `${orders.length} order${orders.length > 1 ? "s" : ""} · ${totalItems} item${totalItems !== 1 ? "s" : ""} total`
                : "Your order history will appear here."}
            </p>
          </div>
        </div>

        {isLoading || authLoading ? (
          <div className="mt-10 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-10 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-10 text-center">
            <p className="text-sm text-destructive">
              Failed to load orders. Please try again later.
            </p>
          </div>
        ) : orders && orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              You haven't placed any orders yet.
            </p>
            <Link to="/catalog">
              <button className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                Browse the collection
              </button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {orders?.map((order) => {
              const items = itemsByOrder(order.id);
              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition hover:shadow-md"
                >
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/30 px-5 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                        Order placed
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                        Total
                      </span>
                      <span className="font-serif text-lg font-semibold text-primary">
                        ₹{order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order body */}
                  <div className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={statusBadge(order.status)}>
                        {statusIcon(order.status)}
                        {order.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ID: {order.id.slice(0, 8)}…
                      </span>
                    </div>

                    {/* Items list */}
                    {items.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-lg bg-secondary/30 px-3 py-2"
                          >
                            {item.product?.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name ?? "Product"}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {item.product?.name ?? "Custom item"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.size.replace("inch", " inch")} · Qty{" "}
                                {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Shipping info */}
                    <div className="mt-4 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Ship to:</span>{" "}
                      {order.customer_name}, {order.shipping_address} —{" "}
                      {order.pincode}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-[var(--cream-soft)]">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} GiftWorldonline — Sculpting memories in
          3D.
        </div>
      </footer>
    </div>
  );
}
