import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShoppingBag,
  LogIn,
  LogOut,
  Search,
  User,
  Menu,
  X,
  Home,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function Header() {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/catalog", search: { q: searchQuery.trim() } });
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

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
          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="border-b-2 border-foreground pb-1 text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/catalog"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Catalog
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Search — always visible */}
            {searchOpen ? (
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-1"
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="h-8 w-32 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:w-44 focus:ring-1 focus:ring-ring sm:w-40 sm:focus:w-52"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-muted-foreground transition hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex text-muted-foreground transition hover:text-foreground"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            {/* Desktop auth controls */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {user ? (
                <>
                  {(user.email === import.meta.env.VITE_ADMIN_EMAIL ||
                    user.email?.toLowerCase() ===
                      "admin@giftworldonline.com") && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="text-muted-foreground transition hover:text-foreground"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>

            {/* Cart icon — only when signed in */}
            {user && (
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
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex text-muted-foreground transition hover:text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-in drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-72">
          <SheetHeader className="text-left">
            <SheetTitle className="font-serif text-xl">Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Site navigation
            </SheetDescription>
          </SheetHeader>

          <nav className="mt-8 flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              <Home className="h-4 w-4 text-muted-foreground" />
              Home
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <LayoutGrid className="h-4 w-4" />
              Catalog
            </Link>

            {user && (
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <ShoppingBag className="h-4 w-4" />
                Cart
                {count > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
            )}

            {user &&
              (user.email === import.meta.env.VITE_ADMIN_EMAIL ||
                user.email?.toLowerCase() ===
                  "admin@giftworldonline.com") && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  Admin
                </Link>
              )}

            <div className="my-3 border-t border-border" />

            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}