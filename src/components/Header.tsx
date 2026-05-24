import { Link } from "@tanstack/react-router";
import { ShoppingBag, LogIn, LogOut, Search, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, signOut } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--cream)] font-serif text-xl italic text-primary">
            G
          </div>
          <div className="leading-tight">
            <div className="font-serif text-2xl tracking-tight">
              <span className="text-primary">Gift</span>
              <span className="italic text-foreground">WorldOnline</span>
              <sup className="ml-0.5 text-xs">®</sup>
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Sculpting memories in 3D
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/" className="border-b-2 border-foreground pb-1 text-sm font-medium">
              Home
            </Link>
            <a href="#collection" className="text-sm text-muted-foreground transition hover:text-foreground">
              Catalog
            </a>
            {/*<a href="#collection" className="text-sm text-muted-foreground transition hover:text-foreground">
              Products
            </a>
            <a href="#bestseller" className="text-sm text-muted-foreground transition hover:text-foreground">
              Best seller
            </a>
            <a href="#about" className="text-sm text-muted-foreground transition hover:text-foreground">
              About us
            </a>*/}
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden text-muted-foreground transition hover:text-foreground sm:inline-flex">
              <Search className="h-5 w-5" />
            </button>
            {user ? (
              <div className="flex items-center gap-1">
                {(user.email === import.meta.env.VITE_ADMIN_EMAIL || user.email?.toLowerCase() === "admin@giftworldonline.com") && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Link to="/auth" className="text-muted-foreground transition hover:text-foreground">
                <User className="h-5 w-5" />
              </Link>
            )}
            <Link
              to="/cart"
              className="relative inline-flex items-center text-muted-foreground transition hover:text-foreground"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}