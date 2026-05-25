import { Link } from "@tanstack/react-router";
import { Gift, Gem, Truck, Headset, Facebook, Instagram } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import giftBoxImg from "@/assets/footer_gift_box.png";

export function Footer() {
  const [email, setEmail] = useState("");

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you for subscribing! Keep an eye on your inbox.");
    setEmail("");
  }

  return (
    <footer className="w-full">
      {/* 1. WHY CHOOSE GIFTWORLD SECTION */}
      <section className="bg-[#faf6eb]/50 py-12 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-10">
            Why Choose Giftworld Online?
          </h3>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-background shadow-sm">
                <Gift className="h-6 w-6 text-[#c59b27]" />
              </div>
              <h4 className="font-serif text-base font-semibold text-foreground mb-1.5">
                Unique & Meaningful Gifts
              </h4>
              <p className="max-w-[240px] text-xs text-muted-foreground leading-relaxed">
                Carefully curated to make every moment special.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-background shadow-sm">
                <Gem className="h-6 w-6 text-[#c59b27]" />
              </div>
              <h4 className="font-serif text-base font-semibold text-foreground mb-1.5">
                Premium Quality
              </h4>
              <p className="max-w-[240px] text-xs text-muted-foreground leading-relaxed">
                High-quality products that leave a lasting impression.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-background shadow-sm">
                <Truck className="h-6 w-6 text-[#c59b27]" />
              </div>
              <h4 className="font-serif text-base font-semibold text-foreground mb-1.5">
                Fast & Reliable Delivery
              </h4>
              <p className="max-w-[240px] text-xs text-muted-foreground leading-relaxed">
                Timely delivery, right to your doorstep.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-background shadow-sm">
                <Headset className="h-6 w-6 text-[#c59b27]" />
              </div>
              <h4 className="font-serif text-base font-semibold text-foreground mb-1.5">
                Dedicated Support
              </h4>
              <p className="max-w-[240px] text-xs text-muted-foreground leading-relaxed">
                We're here to help you at every step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NEWSLETTER & LINKS SECTION */}
      <div className="bg-[#111111] text-gray-300">
        {/* Newsletter banner */}
        <section className="relative border-b border-white/5 overflow-hidden">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-10 lg:flex-row">
            {/* Left: Heading and description */}
            <div className="flex w-full flex-col gap-2 text-center lg:w-5/12 lg:text-left">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#c59b27] uppercase">
                Stay in the Loop
              </span>
              <h3 className="font-serif text-2xl font-medium text-white md:text-3xl">
                Get Special Offers & Gift Ideas
              </h3>
              <p className="text-xs text-gray-400">
                Subscribe to our newsletter and never miss an update!
              </p>
            </div>

            {/* Center/Right: Subscribe form */}
            <div className="flex w-full justify-center lg:w-4/12">
              <form onSubmit={handleSubscribe} className="flex w-full max-w-md">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-transparent border border-gray-700 text-white placeholder:text-gray-500 rounded-l-md px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:border-gray-500 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="bg-[#c59b27] hover:bg-[#b0871e] text-white font-medium px-6 py-2.5 rounded-r-md text-xs md:text-sm transition-all duration-200 shrink-0 cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Right: Gift box image side-by-side to avoid overlapping the input */}
            <div className="hidden lg:flex lg:w-3/12 justify-end select-none pointer-events-none">
              <img
                src={giftBoxImg}
                alt="Gift Box"
                className="h-28 w-auto object-contain brightness-95"
              />
            </div>
          </div>
        </section>

        {/* Directory links */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div className="flex flex-col text-left">
              <div className="flex flex-col text-left mb-4">
                <span className="font-serif text-2xl font-bold leading-tight text-white">
                  GiftWorld
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-[0.25em] uppercase leading-none">
                  Online
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Unique gifts for every occasion.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-xs font-bold tracking-wider text-white uppercase mb-4">
                Quick Links
              </h4>
              <nav className="flex flex-col gap-2.5 text-xs text-gray-400">
                <Link to="/" className="hover:text-white transition-colors duration-200">
                  Home
                </Link>
                <Link to="/catalog" className="hover:text-white transition-colors duration-200">
                  Shop
                </Link>
                <Link to="/catalog" className="hover:text-white transition-colors duration-200">
                  About Us
                </Link>
                <a href="https://wa.me/919334680454" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">
                  Contact Us
                </a>
              </nav>
            </div>

            {/* Customer service */}
            <div>
              <h4 className="text-xs font-bold tracking-wider text-white uppercase mb-4">
                Customer Service
              </h4>
              <nav className="flex flex-col gap-2.5 text-xs text-gray-400">
                <Link to="/orders" className="hover:text-white transition-colors duration-200">
                  Track Order
                </Link>
                <Link to="/catalog" className="hover:text-white transition-colors duration-200">
                  Shipping Policy
                </Link>
                <Link to="/catalog" className="hover:text-white transition-colors duration-200">
                  Returns & Refunds
                </Link>
                <Link to="/catalog" className="hover:text-white transition-colors duration-200">
                  FAQ
                </Link>
              </nav>
            </div>

            {/* Follow us */}
            <div>
              <h4 className="text-xs font-bold tracking-wider text-white uppercase mb-4">
                Follow Us
              </h4>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200"
                  aria-label="Pinterest"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.76-2.245 3.76-5.487 0-2.861-2.063-4.869-5.007-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.211-.174.256-.402.148-1.503-.7-2.44-2.896-2.44-4.661 0-3.796 2.758-7.281 7.951-7.281 4.173 0 7.413 2.974 7.413 6.95 0 4.148-2.611 7.486-6.233 7.486-1.219 0-2.365-.635-2.757-1.379l-.752 2.871c-.274 1.047-.986 2.362-1.467 3.145 1.13.349 2.327.537 3.567.537 6.612 0 11.978-5.366 11.978-11.987C23.985 5.367 18.62 0 12.017 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Base copyright line */}
        <section className="border-t border-white/5 py-8">
          <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <span>
              © {new Date().getFullYear()} GiftWorldOnline. All rights reserved.
            </span>
            <span>
              Sculpting memories in 3D.
            </span>
          </div>
        </section>
      </div>
    </footer>
  );
}
