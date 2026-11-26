import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  bangladeshAreas,
  findDistrict,
  findDivision,
  findUpazila,
  geographyStatus,
} from "@/data/bangladesh";
import {
  categories,
  discountPercent,
  formatBDT,
  getProduct,
  getVariant,
  products,
  searchProducts,
  setCatalogProducts,
  type Product,
} from "@/lib/catalog";
import {
  getPathaoStatus,
  getPaymentStatus,
  getSupabaseBrowserStatus,
} from "@/lib/integrations";
import {
  addToCart,
  cartCount,
  setCart,
  cartSubtotal,
  getCart,
  getOrderRequests,
  getWishlist,
  makeOrderId,
  removeFromCart,
  saveOrderRequest,
  toggleWishlist,
  updateCartQuantity,
  validateCheckout,
  type CartItem,
  type DeliveryAddress,
  type OrderRequest,
} from "@/lib/store";
import NotFound from "@/pages/NotFound";
import TrackOrderPage from "@/pages/TrackOrderPage";
import { createGuestCodOrder, fetchCatalog, fetchShopStatus } from "@/lib/shopApi";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
  ArrowUpRight,
  ChevronDown,
  Check,
  Minus,
  Plus,
  MapPin,
  Truck,
  ShieldCheck,
  CircleHelp,
  Mail,
  Instagram,
  Facebook,
  Star,
  LockKeyhole,
  ArrowRight,
  PackageCheck,
  SlidersHorizontal,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function useStoreState() {
  const [, rerender] = useState(0);
  useEffect(() => {
    const handler = () => rerender(value => value + 1);
    window.addEventListener("neweix-store-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("neweix-store-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return { cart: getCart().filter(item => products.some(product => product.id === item.productId)), wishlist: getWishlist() };
}

function Logo() {
  return (
    <Link href="/" className="brand-mark" aria-label="NEWEIX home">
      <span className="brand-spark">✦</span>
      <span>NEWEIX</span>
    </Link>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3400);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);
  return (
    <div className="toast" role="status">
      <span>{message}</span>
      <button onClick={onClose} aria-label="Dismiss notification">
        <X size={15} />
      </button>
    </div>
  );
}

function SiteHeader({
  onMenu,
  cartItems,
  wishlistCount,
  onNotify,
}: {
  onMenu: () => void;
  cartItems: CartItem[];
  wishlistCount: number;
  onNotify: (message: string) => void;
}) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim())
      setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
  };
  return (
    <>
      <div className="announcement">
        <span>Delivery coverage and fees are confirmed by area</span>
        <Link href="/faq">
          How it works <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className="site-header">
        <button
          className="icon-button menu-button"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>
        <Logo />
        <form className="header-search" onSubmit={submitSearch}>
          <Search size={16} />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search the edit"
            aria-label="Search products"
          />
          <button type="submit" aria-label="Submit search">
            <ArrowRight size={15} />
          </button>
        </form>
        <div className="header-actions">
          <button
            className="icon-button desktop-auth-button"
            onClick={() => setAuthOpen(open => !open)}
            aria-label="Open account"
          >
            <UserRound size={19} />
          </button>
          <Link
            href="/wishlist"
            className="icon-button counted-icon"
            aria-label="Wishlist"
          >
            <Heart size={19} />
            <span className="count-badge">{wishlistCount}</span>
          </Link>
          <Link
            href="/cart"
            className="icon-button counted-icon"
            aria-label="Shopping cart"
          >
            <ShoppingBag size={19} />
            <span className="count-badge">{cartCount(cartItems)}</span>
          </Link>
        </div>
        {authOpen && (
          <div className="quick-auth-popover">
            <p className="eyebrow">Your NEWEIX</p>
            <strong>Make the edit yours.</strong>
            <Link href="/account" onClick={() => setAuthOpen(false)}>
              Open account <ArrowUpRight size={14} />
            </Link>
            <Link href="/signin" onClick={() => setAuthOpen(false)}>
              Sign in / create account <ArrowUpRight size={14} />
            </Link>
          </div>
        )}
      </header>
    </>
  );
}

function MobileNav({
  cartItems,
  wishlistCount,
}: {
  cartItems: CartItem[];
  wishlistCount: number;
}) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <Link href="/">
        <span className="mobile-nav-icon">⌂</span>
        <span>Home</span>
      </Link>
      <Link href="/shop">
        <SlidersHorizontal size={18} />
        <span>Browse</span>
      </Link>
      <Link href="/wishlist" className="mobile-count-link">
        <Heart size={18} />
        <span>Saved</span>
        {wishlistCount > 0 && <b>{wishlistCount}</b>}
      </Link>
      <Link href="/cart" className="mobile-count-link">
        <ShoppingBag size={18} />
        <span>Bag</span>
        {cartCount(cartItems) > 0 && <b>{cartCount(cartItems)}</b>}
      </Link>
      <Link href="/account">
        <UserRound size={18} />
        <span>Account</span>
      </Link>
    </nav>
  );
}

function MenuDrawer({
  open,
  onClose,
  userName,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  userName?: string | null;
  onLogout: () => void;
}) {
  if (!open) return null;
  const links = [
    ["My Orders", "/orders"],
    ["Order Track", "/orders"],
    ["Wishlist", "/wishlist"],
    ["Shopping Cart", "/cart"],
    ["Language · English", "/account"],
    ["Wallet", "/wallet"],
    ["Neweix+", "/neweix-plus"],
    ["eixverse", "/eixverse"],
    ["FAQ", "/faq"],
    ["Contact", "/contact"],
  ];
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="menu-drawer" onClick={event => event.stopPropagation()}>
        <div className="drawer-top">
          <Logo />
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="drawer-intro">
          <span className="eyebrow">The NEWEIX menu</span>
          <h2>
            Useful things,
            <br />
            kept close.
          </h2>
        </div>
        <nav className="drawer-links">
          {links.map(([label, href]) => (
            <Link key={label} href={href} onClick={onClose}>
              {label}
              <ArrowUpRight size={14} />
            </Link>
          ))}
        </nav>
        <div className="drawer-footer">
          {userName ? (
            <>
              <span>Signed in as {userName}</span>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/signin" onClick={onClose}>
              Sign in / create account <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}

function PageFrame({
  eyebrow,
  title,
  intro,
  children,
  action,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <main className="page-frame">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {intro && <p>{intro}</p>}
        </div>
        {action}
      </div>
      {children}
    </main>
  );
}

function ProductCard({
  product,
  onNotify,
  compact = false,
}: {
  product: Product;
  onNotify: (message: string) => void;
  compact?: boolean;
}) {
  const { wishlist } = useStoreState();
  const [, setLocation] = useLocation();
  const variant = getVariant(product);
  const saved = wishlist.includes(product.id);
  const discount = discountPercent(variant);
  const save = () => {
    toggleWishlist(product.id);
    onNotify(
      saved ? "Removed from your saved edit." : "Saved to your wishlist."
    );
  };
  const add = (buyNow = false) => {
    addToCart(product.id, variant.id, 1, variant.stock);
    onNotify(`${product.name} added to your bag.`);
    if (buyNow) setLocation("/cart");
  };
  return (
    <article
      className={`product-card ${compact ? "product-card-compact" : ""}`}
    >
      <div className="product-image-wrap">
        <Link href={`/product/${product.slug}`} className="product-image-link">
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <div className="product-card-top">
          <span className="product-tag">
            {discount
              ? `${discount}% off`
              : product.tags.includes("new")
                ? "New in"
                : product.category}
          </span>
          <button
            onClick={save}
            className={`heart-button ${saved ? "is-saved" : ""}`}
            aria-label={
              saved
                ? `Remove ${product.name} from wishlist`
                : `Save ${product.name}`
            }
          >
            <Heart size={18} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
      <div className="product-card-copy">
        <span className="eyebrow">{product.eyebrow}</span>
        <Link href={`/product/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="product-price">
          <strong>{formatBDT(variant.price)}</strong>
          {variant.compareAt && <del>{formatBDT(variant.compareAt)}</del>}
        </div>
        <div className="card-actions">
          <button
            className="button button-dark button-small"
            disabled={!variant.stock}
            onClick={() => add(false)}
          >
            {variant.stock ? "Add to bag" : "Out of stock"}
          </button>
          <button
            className="button button-quiet button-small"
            disabled={!variant.stock}
            onClick={() => add(true)}
          >
            Buy now <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

function HomePage({ onNotify }: { onNotify: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const featured = products.filter(product => product.featured);
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim())
      setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
  };
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">
            The NEWEIX edit · 01 / 04
          </span>
          <h1>
            A better edit of <em>everyday.</em>
          </h1>
          <p>
            Useful objects, quiet details, and the small upgrades that make a
            day feel more like yours.
          </p>
          <form className="hero-search" onSubmit={submitSearch}>
            <Search size={18} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="What are you looking for?"
            />
            <button type="submit">
              Search <ArrowRight size={16} />
            </button>
          </form>
          <div className="hero-notes">
            <span>
              <ShieldCheck size={15} /> Thoughtfully sourced
            </span>
            <span>
              <Truck size={15} /> Delivery coverage checked by area
            </span>
          </div>
        </div>
        <div className="hero-media">
          <img
            src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1400&q=90"
            alt="A calm, sunlit workspace with carefully chosen objects"
          />
          <div className="hero-caption">
            <span>Objects for slower mornings</span>
            <span>Scroll to explore ↓</span>
          </div>
        </div>
      </section>
      <section className="ticker">
        <div>
          Independent finds <span>✦</span> Made to be kept <span>✦</span> No
          noise, just good things <span>✦</span> Independent finds{" "}
          <span>✦</span>
        </div>
      </section>
      <section className="editorial-intro content-width">
        <div>
          <span className="eyebrow">A considered starting point</span>
          <h2>
            Small upgrades.
            <br />
            <em>Lasting presence.</em>
          </h2>
        </div>
        <div className="editorial-intro-copy">
          <p>
            NEWEIX is an independent edit of objects for the way you actually
            live — made by thoughtful makers, chosen for their use, and kept
            close for a long time.
          </p>
          <Link className="text-link" href="/shop">
            Shop the full edit <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <section className="featured-section content-width">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 — The current edit</span>
            <h2>Picked for now</h2>
          </div>
          <Link className="text-link" href="/shop">
            View all objects <ArrowRight size={15} />
          </Link>
        </div>
        <div className="product-grid">
          {featured.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onNotify={onNotify}
            />
          ))}
        </div>
      </section>
      <section className="split-story content-width">
        <div className="split-story-image">
          <img
            src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=88"
            alt="A clean desk with a notebook and lamp"
          />
        </div>
        <div className="split-story-copy">
          <span className="eyebrow">02 — The everyday note</span>
          <h2>Good design should make room for your life.</h2>
          <p>
            Not louder. Not more complicated. Just a little more intentional. We
            look for things that earn their place, from the first use to the
            hundredth.
          </p>
          <Link href="/shop?category=Desk" className="button button-outline">
            Explore the desk edit <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <section className="category-strip content-width">
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 — Find your angle</span>
            <h2>Shop by feeling</h2>
          </div>
        </div>
        <div className="category-links">
          {[
            ["New in", "New In", "photo-1515372039744-b8f02a3ae446"],
            ["For the desk", "Desk", "photo-1499750310107-5fef28a66643"],
            ["For the home", "Home", "photo-1618220179428-22790b461013"],
            ["For the road", "Carry", "photo-1548036328-c9fa89d128fa"],
          ].map(([label, category, imageId]) => (
            <Link
              key={category}
              href={`/shop?category=${encodeURIComponent(category)}`}
              className="category-tile"
            >
              <img
                src={`https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=700&q=84`}
                alt=""
              />
              <span>{label}</span>
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>
      </section>
      <section className="newsletter-band">
        <div>
          <span className="eyebrow">04 — A note from NEWEIX</span>
          <h2>
            Keep a little room
            <br />
            <em>for good things.</em>
          </h2>
        </div>
        <form
          onSubmit={event => {
            event.preventDefault();
            onNotify("You're on the list. We'll keep it considered.");
          }}
        >
          <label htmlFor="newsletter">
            Occasional notes, new finds, no noise.
          </label>
          <div className="newsletter-input">
            <input
              id="newsletter"
              type="email"
              placeholder="Your email address"
              required
            />
            <button type="submit">
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function ShopPage({ onNotify }: { onNotify: (message: string) => void }) {
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get("category") || "All";
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("Featured");
  const result = useMemo(() => {
    const items = searchProducts("", category);
    if (sort === "Price low")
      return [...items].sort(
        (a, b) => getVariant(a).price - getVariant(b).price
      );
    if (sort === "Price high")
      return [...items].sort(
        (a, b) => getVariant(b).price - getVariant(a).price
      );
    return items;
  }, [category, sort]);
  return (
    <PageFrame
      eyebrow="The catalog"
      title="The edit"
      intro="Objects with a point of view, chosen for their usefulness and staying power."
      action={<div className="result-count">{result.length} objects</div>}
    >
      <div className="catalog-toolbar">
        <div className="filter-pills">
          {categories.map(item => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="sort-control">
          Sort{" "}
          <select value={sort} onChange={event => setSort(event.target.value)}>
            <option>Featured</option>
            <option>Price low</option>
            <option>Price high</option>
          </select>
          <ChevronDown size={15} />
        </label>
      </div>
      <div className="product-grid catalog-grid">
        {result.map(product => (
          <ProductCard key={product.id} product={product} onNotify={onNotify} />
        ))}
      </div>
      {result.length === 0 && (
        <EmptyState
          title={products.length === 0 ? "The catalog is being prepared" : "Nothing here yet"}
          body={products.length === 0 ? "No products have been published to the Shop catalog yet. Please check back soon." : "Try another category or search the full edit."}
          action={
            <Link href="/shop" className="button button-dark">
              See everything
            </Link>
          }
        />
      )}
    </PageFrame>
  );
}

function SearchPage({ onNotify }: { onNotify: (message: string) => void }) {
  const query = new URLSearchParams(window.location.search).get("q") || "";
  const result = searchProducts(query);
  return (
    <PageFrame
      eyebrow="Search results"
      title={query ? `Results for “${query}”` : "Search the edit"}
      intro={
        query
          ? `${result.length} objects found across the catalog.`
          : "Start with a word, a category, or a feeling."
      }
    >
      <div className="product-grid catalog-grid">
        {result.map(product => (
          <ProductCard key={product.id} product={product} onNotify={onNotify} />
        ))}
      </div>
      {result.length === 0 && (
        <EmptyState
          title="No exact match"
          body="Try “desk”, “home”, “carry”, or browse the full edit."
          action={
            <Link href="/shop" className="button button-dark">
              Browse all
            </Link>
          }
        />
      )}
    </PageFrame>
  );
}

function ProductPage({
  slug,
  onNotify,
}: {
  slug?: string;
  onNotify: (message: string) => void;
}) {
  const product = getProduct(slug);
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants[0]?.id || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [, setLocation] = useLocation();
  const { wishlist } = useStoreState();
  if (!product) return <NotFound />;
  const variant = getVariant(product, selectedVariant);
  const saved = wishlist.includes(product.id);
  const discount = discountPercent(variant);
  const add = (buyNow: boolean) => {
    addToCart(product.id, variant.id, quantity, variant.stock);
    onNotify(`${product.name} added to your bag.`);
    if (buyNow) setLocation("/cart");
  };
  return (
    <main className="product-detail content-width">
      <div className="breadcrumbs">
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <div className="product-detail-grid">
        <div className="product-gallery">
          <div className="gallery-main">
            <img src={product.gallery[activeImage]} alt={product.name} />
          </div>
          <div className="gallery-thumbs">
            {product.gallery.map((item, index) => (
              <button
                key={item}
                className={activeImage === index ? "active" : ""}
                onClick={() => setActiveImage(index)}
              >
                <img src={item} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div className="product-detail-copy">
          <span className="eyebrow">{product.eyebrow}</span>
          <h1>{product.name}</h1>
          {product.reviewCount > 0 && (
            <div className="detail-rating">
              <span className="stars">
                {"★".repeat(Math.round(product.rating))}
              </span>
              <span>
                {product.rating} · {product.reviewCount} reviews
              </span>
            </div>
          )}
          <div className="detail-price">
            <strong>{formatBDT(variant.price)}</strong>
            {variant.compareAt && (
              <>
                <del>{formatBDT(variant.compareAt)}</del>
                <span className="discount-chip">{discount}% off</span>
              </>
            )}
          </div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-rule" />
          {product.variants.length > 1 && (
            <div className="variant-picker">
              <div className="field-label">
                <span>Color</span>
                <strong>{variant.label}</strong>
              </div>
              <div className="variant-options">
                {product.variants.map(item => (
                  <button
                    key={item.id}
                    className={item.id === variant.id ? "active" : ""}
                    onClick={() => setSelectedVariant(item.id)}
                  >
                    {item.label}
                    {discountPercent(item) > 0 && (
                      <small>{discountPercent(item)}% off</small>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="quantity-row">
            <div className="quantity-control">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(variant.stock, quantity + 1))
                }
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
            <span className="stock-note">
              {variant.stock > 0 ? `${variant.stock} in stock` : "Out of stock"}
            </span>
          </div>
          <div className="detail-actions">
            <button
              className="button button-dark button-wide"
              disabled={!variant.stock}
              onClick={() => add(false)}
            >
              Add to bag <ShoppingBag size={16} />
            </button>
            <button
              className="button button-outline button-wide"
              disabled={!variant.stock}
              onClick={() => add(true)}
            >
              Buy now <ArrowUpRight size={16} />
            </button>
            <button
              className={`save-detail ${saved ? "is-saved" : ""}`}
              onClick={() => {
                toggleWishlist(product.id);
                onNotify(
                  saved
                    ? "Removed from your saved edit."
                    : "Saved to your wishlist."
                );
              }}
            >
              <Heart size={18} fill={saved ? "currentColor" : "none"} />{" "}
              <span>{saved ? "Saved" : "Save"}</span>
            </button>
          </div>
          <div className="detail-promises">
            <div>
              <Truck size={17} />
              <span>
                <strong>Delivery, verified first</strong>Coverage and fees are checked for your area before an order is accepted.
              </span>
            </div>
            <div>
              <LockKeyhole size={17} />
              <span>
                <strong>Secure checkout</strong>Your payment is only verified by
                the provider.
              </span>
            </div>
            <div>
              <CircleHelp size={17} />
              <span>
                <strong>Need a hand?</strong>
                <Link href="/contact">Talk to the team</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
      <section className="product-story">
        <div>
          <span className="eyebrow">Why it belongs</span>
          <h2>{product.editorial}</h2>
        </div>
        <div>
          <p>{product.description}</p>
          <ul>
            {product.details.map(detail => (
              <li key={detail}>
                <Check size={15} />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Reviews product={product} />
    </main>
  );
}

function Reviews({ product }: { product: Product }) {
  if (product.reviews.length === 0) return null;
  return (
    <section className="reviews-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Customer notes</span>
          <h2>What people keep saying</h2>
        </div>
        <span className="review-summary">
          <span className="stars">★</span> {product.rating} from{" "}
          {product.reviewCount} reviews
        </span>
      </div>
      <div className="reviews-grid">
        {product.reviews.map(review => (
          <article key={review.id} className="review-card">
            <div className="review-card-top">
              <span className="stars">{"★".repeat(review.rating)}</span>
              <span>{review.date}</span>
            </div>
            <h3>{review.title}</h3>
            <p>“{review.body}”</p>
            <strong>{review.name}</strong>
          </article>
        ))}
      </div>
      <p className="review-footnote">
        Reviews are viewable without an account. Sign in to share your own
        experience after a verified purchase.
      </p>
    </section>
  );
}

function CartPage({ onNotify }: { onNotify: (message: string) => void }) {
  const { cart } = useStoreState();
  const [, setLocation] = useLocation();
  const subtotal = cartSubtotal(
    cart,
    id => products.find(product => product.id === id),
    (product, id) => getVariant(product, id)
  );
  return (
    <PageFrame
      eyebrow="Your selection"
      title="Shopping bag"
      intro={
        cart.length
          ? "Keep the good things close until you are ready."
          : "Your bag is waiting for something worth keeping."
      }
    >
      {cart.length === 0 ? (
        <EmptyState
          title="Your bag is empty"
          body="Start with a quiet browse through the current edit."
          action={
            <Link href="/shop" className="button button-dark">
              Shop the edit <ArrowRight size={15} />
            </Link>
          }
        />
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {cart.map(item => {
              const product = getProduct(item.productId)!;
              const variant = getVariant(product, item.variantId);
              return (
                <article
                  className="cart-line"
                  key={`${item.productId}-${item.variantId}`}
                >
                  <img src={product.image} alt={product.name} />
                  <div className="cart-line-copy">
                    <span className="eyebrow">{product.category}</span>
                    <h3>{product.name}</h3>
                    <p>
                      {variant.label} · {formatBDT(variant.price)}
                    </p>
                    <button
                      onClick={() => {
                        removeFromCart(item.productId, item.variantId);
                        onNotify("Removed from your bag.");
                      }}
                      className="remove-link"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cart-line-controls">
                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.productId,
                            item.variantId,
                            Math.max(1, item.quantity - 1),
                            variant.stock
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.productId,
                            item.variantId,
                            Math.min(variant.stock, item.quantity + 1),
                            variant.stock
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <strong>{formatBDT(variant.price * item.quantity)}</strong>
                  </div>
                </article>
              );
            })}
          </div>
          <aside className="summary-card">
            <span className="eyebrow">Order summary</span>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatBDT(subtotal)}</strong>
            </div>
            <div className="summary-row summary-muted">
              <span>Delivery</span>
              <span>Verified after address</span>
            </div>
            <div className="summary-rule" />
            <div className="summary-row total-row">
              <span>Product subtotal</span>
              <strong>{formatBDT(subtotal)}</strong>
            </div>
            <p className="summary-note">
              Live delivery pricing is not shown until your area is checked. No
              quote is fabricated at checkout.
            </p>
            <button
              className="button button-dark button-wide"
              onClick={() => setLocation("/checkout")}
            >
              Continue to checkout <ArrowRight size={16} />
            </button>
            <Link className="continue-link" href="/shop">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </PageFrame>
  );
}

function CheckoutPage({ onNotify, guestCheckoutEnabled }: { onNotify: (message: string) => void; guestCheckoutEnabled: boolean }) {
  const { cart } = useStoreState();
  const [address, setAddress] = useState<DeliveryAddress>({
    name: "",
    phone: "",
    division: "",
    district: "",
    upazila: "",
    union: "",
    line1: "",
    note: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey] = useState(() => `shop-${crypto.randomUUID()}`);
  const [, setLocation] = useLocation();
  const subtotal = cartSubtotal(
    cart,
    id => products.find(product => product.id === id),
    (product, id) => getVariant(product, id)
  );
  const division = findDivision(address.division);
  const district = findDistrict(address.division, address.district);
  const upazila = findUpazila(
    address.division,
    address.district,
    address.upazila
  );
  const updateAddress = (field: keyof DeliveryAddress, value: string) =>
    setAddress(current => ({
      ...current,
      [field]: value,
      ...(field === "division" ? { district: "", upazila: "", union: "" } : {}),
      ...(field === "district" ? { upazila: "", union: "" } : {}),
      ...(field === "upazila" ? { union: "" } : {}),
    }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || submitted) return;
    setError("");
    const validation = validateCheckout(address, paymentMethod);
    if (!validation.valid) {
      setError(
        `Please complete: ${validation.missing.join(", ")}${validation.paymentMissing ? ", payment method" : ""}.`
      );
      return;
    }
    if (paymentMethod !== "cod") {
      const unavailable: Record<string, string> = {
        eixon_wallet: "Eixon Wallet requires Neweix Account authentication and an active, approved Eixon Shop payment contract.",
        bkash: "bKash checkout is disabled until gateway credentials, webhook verification and legal approval are complete.",
        nagad: "Nagad checkout is disabled until gateway credentials, webhook verification and legal approval are complete.",
        card: "Card checkout is disabled until a compliant card gateway and legal approval are complete.",
      };
      setError(unavailable[paymentMethod] ?? "This payment method is not available.");
      return;
    }
    const validItems = cart.flatMap(item => {
      const product = products.find(entry => entry.id === item.productId);
      const variant = product?.variants.find(entry => entry.id === item.variantId);
      return variant && variant.stock >= item.quantity
        ? [{ variantId: variant.id, quantity: item.quantity }]
        : [];
    });
    if (!validItems.length || validItems.length !== cart.length) {
      setError("Your bag contains an unavailable product or quantity. Refresh the catalog and update your bag.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createGuestCodOrder({
        guestName: address.name,
        phone: address.phone,
        address: {
          division: address.division,
          district: address.district,
          upazila: address.upazila,
          unionOrArea: address.union,
          addressLine: address.line1,
        },
        items: validItems,
        note: address.note,
        idempotencyKey,
      });
      setSubmitted(true);
      setCart([]);
      onNotify(`Order ${result.order.order_number} received for manual review.`);
      setLocation(`/track?orderId=${encodeURIComponent(result.order.id)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your order could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  if (!cart.length)
    return (
      <PageFrame eyebrow="Checkout" title="Nothing to checkout">
        <EmptyState
          title="Your bag is empty"
          body="Add something from the edit before continuing."
          action={
            <Link href="/shop" className="button button-dark">
              Browse the edit
            </Link>
          }
        />
      </PageFrame>
    );
  if (!guestCheckoutEnabled)
    return (
      <PageFrame
        eyebrow="Checkout"
        title="Checkout is temporarily paused"
        intro="Guest COD orders will be accepted only after Shop order review, cancellation, and reserved-stock release operations are implemented and verified. Your cart remains saved."
      >
        <EmptyState
          title="Order operations are not ready"
          body="No order will be submitted and no inventory will be reserved while this safety gate is closed."
          action={
            <Link href="/cart" className="button button-dark">
              Return to your bag
            </Link>
          }
        />
      </PageFrame>
    );
  return (
    <PageFrame
      eyebrow="Secure checkout"
      title="Make it yours"
      intro="Tell us where to send it. Delivery is verified manually when live pricing is not configured."
    >
      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-main">
          <section className="checkout-section">
            <div className="checkout-section-heading">
              <span className="step-number">01</span>
              <div>
                <span className="eyebrow">Delivery information</span>
                <h2>Where should it go?</h2>
              </div>
            </div>
            <div className="form-grid">
              <Field
                label="Full name"
                value={address.name}
                onChange={value => updateAddress("name", value)}
                placeholder="Your name"
              />
              <Field
                label="Phone number"
                value={address.phone}
                onChange={value => updateAddress("phone", value)}
                placeholder="01XXXXXXXXX"
                type="tel"
              />
              <Field
                label="Address line"
                value={address.line1}
                onChange={value => updateAddress("line1", value)}
                placeholder="House, road, area"
                full
              />
              <SelectField
                label="Division"
                value={address.division}
                onChange={value => updateAddress("division", value)}
                options={bangladeshAreas.map(area => area.name)}
              />
              <SelectField
                label="District"
                value={address.district}
                onChange={value => updateAddress("district", value)}
                options={division?.districts.map(area => area.name) ?? []}
                disabled={!division}
              />
              <SelectField
                label="Upazila / thana"
                value={address.upazila}
                onChange={value => updateAddress("upazila", value)}
                options={district?.upazilas.map(area => area.name) ?? []}
                disabled={!district}
              />
              <SelectField
                label="Union / area"
                value={address.union}
                onChange={value => updateAddress("union", value)}
                options={upazila?.upazilas ?? []}
                disabled={!upazila}
              />
              <Field
                label="Delivery note (optional)"
                value={address.note || ""}
                onChange={value => updateAddress("note", value)}
                placeholder="Landmark or timing note"
                full
              />
            </div>
            <div className="geography-note">
              <MapPin size={16} />
              <span>
                {geographyStatus} If your area is not listed, contact us for
                manual handling.
              </span>
            </div>
          </section>
          <section className="checkout-section">
            <div className="checkout-section-heading">
              <span className="step-number">02</span>
              <div>
                <span className="eyebrow">Payment method</span>
                <h2>Choose how to pay</h2>
              </div>
            </div>
            <div className="payment-options">
              {[
                { id: "eixon_wallet", title: "Eixon Wallet", note: "Requires Neweix Account and an active Eixon payment contract.", enabled: false },
                { id: "cod", title: "Cash on Delivery", note: "Guest checkout is supported. New orders enter manual delivery review.", enabled: true },
                { id: "bkash", title: "bKash", note: "Pending gateway credentials, webhook verification and legal approval.", enabled: false },
                { id: "nagad", title: "Nagad", note: "Pending gateway credentials, webhook verification and legal approval.", enabled: false },
                { id: "card", title: "Debit / Credit Card", note: "Pending compliant card gateway and legal approval.", enabled: false },
              ].map(method => (
                <label
                  className={`payment-option ${paymentMethod === method.id ? "active" : ""}`}
                  key={method.id}
                  aria-disabled={!method.enabled}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    disabled={!method.enabled}
                    onChange={event => setPaymentMethod(event.target.value)}
                  />
                  <span>
                    <strong>{method.title}</strong>
                    <small>{method.note}</small>
                  </span>
                  <span className="radio-dot" />
                </label>
              ))}
            </div>
            <div className="payment-note">
              <LockKeyhole size={15} />
              <span>
                We never claim payment success until the configured provider
                verifies it. {getPaymentStatus().message}
              </span>
            </div>
          </section>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
        </div>
        <aside className="summary-card checkout-summary">
          <span className="eyebrow">Your order</span>
          {cart.map(item => {
            const product = getProduct(item.productId)!;
            const variant = getVariant(product, item.variantId);
            return (
              <div
                className="checkout-mini-line"
                key={`${item.productId}-${item.variantId}`}
              >
                <img src={product.image} alt="" />
                <span>
                  {product.name}
                  <small>
                    {variant.label} × {item.quantity}
                  </small>
                </span>
                <strong>{formatBDT(variant.price * item.quantity)}</strong>
              </div>
            );
          })}
          <div className="summary-rule" />
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatBDT(subtotal)}</strong>
          </div>
          <div className="summary-row summary-muted">
            <span>Delivery</span>
            <span>Manual verification</span>
          </div>
          <div className="summary-rule" />
          <div className="summary-row total-row">
            <span>Final payable total</span>
            <strong>Pending review</strong>
          </div>
          <button
            className="button button-dark button-wide"
            disabled={submitted || submitting}
            type="submit"
          >
            {submitting ? "Submitting order…" : submitted ? "Order submitted" : "Place COD order"}{" "}
            <ArrowRight size={16} />
          </button>
          <p className="summary-note">
            Guest checkout remains paused until Admin order review and reserved-stock release are verified. Delivery fees and the final payable amount are never assumed.
          </p>
        </aside>
      </form>
    </PageFrame>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  full = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  full?: boolean;
}) {
  return (
    <label className={`form-field ${full ? "full" : ""}`}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <div className="select-wrap">
        <select
          value={value}
          onChange={event => onChange(event.target.value)}
          disabled={disabled}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map(option => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown size={15} />
      </div>
    </label>
  );
}

function AuthPage({ mode }: { mode: "signin" | "signup" | "forgot" }) {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const authStatus = getSupabaseBrowserStatus();
  const launch = () => {
    setMessage(
      "Neweix Account single sign-on is not connected to Shop yet. Guest checkout remains available without login; Eixon Wallet requires Account authentication."
    );
  };
  if (mode === "forgot")
    return (
      <PageFrame
        eyebrow="Account access"
        title="Reset your password"
        intro="Password recovery is handled by the configured auth provider; no reset is simulated in the browser."
      >
        <div className="auth-card">
          <label className="form-field">
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <button
            className="button button-dark button-wide"
            onClick={() =>
              setMessage(
                "A recovery link will be sent once the server-side auth provider is configured."
              )
            }
          >
            Request recovery link <ArrowRight size={16} />
          </button>
          {message && <div className="form-note">{message}</div>}
          <Link className="text-link" href="/signin">
            Back to sign in <ArrowRight size={15} />
          </Link>
        </div>
      </PageFrame>
    );
  return (
    <PageFrame
      eyebrow="Account access"
      title={mode === "signup" ? "Make the edit yours" : "Welcome back"}
      intro="Guest checkout does not require an account. Account sign-in will be available after secure Neweix SSO is connected."
    >
      <div className="auth-card">
        <div className="auth-provider">
          <span className="provider-mark">N</span>
          <div>
            <strong>Continue with secure account login</strong>
            <p>
              Neweix Account is the approved identity provider. Shop sign-in will activate after the first-party SSO client is registered and verified.
            </p>
          </div>
        </div>
        <button className="button button-dark button-wide" onClick={launch}>
          {mode === "signup" ? "Create account" : "Sign in securely"}{" "}
          <ArrowRight size={16} />
        </button>
        {message && <div className="form-error">{message}</div>}
        <div className="auth-divider">
          <span>or</span>
        </div>
        <div className="auth-safety">
          <LockKeyhole size={16} />
          <span>{authStatus.message}</span>
        </div>
        <div className="auth-links">
          {mode === "signin" ? (
            <>
              <Link href="/signup">
                Create an account <ArrowRight size={14} />
              </Link>
              <Link href="/forgot-password">
                Forgot password? <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <Link href="/signin">
              Already have an account? <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </PageFrame>
  );
}

function AccountPage({
  userName,
  onNotify,
}: {
  userName?: string | null;
  onNotify: (message: string) => void;
}) {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  if (!userName)
    return (
      <PageFrame
        eyebrow="Your NEWEIX"
        title="Make the edit yours"
        intro="Sign in to keep saved objects, order requests, and delivery details together."
      >
        <EmptyState
          title="You are not signed in"
          body="Neweix Account SSO is not connected yet. You can still browse and place guest orders without signing in."
          action={
            <Link className="button button-dark" href="/signin">
              Sign in securely <ArrowRight size={15} />
            </Link>
          }
        />
      </PageFrame>
    );
  return (
    <PageFrame
      eyebrow={`Your NEWEIX · ${userName}`}
      title="My account"
      intro="Personal settings, kept simple and in one place."
    >
      <div className="account-tabs">
        {[
          ["profile", "Personal information"],
          ["delivery", "Delivery information"],
          ["privacy", "Privacy & consent"],
          ["wallet", "Wallet methods"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <section className="account-panel">
        {tab === "profile" && (
          <>
            <span className="eyebrow">Personal information</span>
            <h2>Your details</h2>
            <div className="form-grid">
              <Field label="Name" value={userName} onChange={() => undefined} />
              <Field
                label="Email"
                value="Managed by secure auth provider"
                onChange={() => undefined}
              />
            </div>
            <button
              className="button button-dark"
              onClick={() => {
                setSaved(true);
                onNotify(
                  "Your account preferences are ready to save once the server adapter is configured."
                );
              }}
            >
              {saved ? "Saved locally" : "Save changes"} <Check size={15} />
            </button>
          </>
        )}
        {tab === "delivery" && (
          <>
            <span className="eyebrow">Delivery information</span>
            <h2>Make the next order easier.</h2>
            <p className="panel-copy">
              Saved address details will be persisted through the protected
              customer profile service when configured. Checkout always asks you
              to verify the current address hierarchy again.
            </p>
            <Link href="/checkout" className="button button-outline">
              Go to checkout <ArrowRight size={15} />
            </Link>
          </>
        )}
        {tab === "privacy" && (
          <>
            <span className="eyebrow">Privacy & consent</span>
            <h2>Your choices stay yours.</h2>
            <label className="consent-row">
              <input type="checkbox" defaultChecked />
              <span>
                <strong>Essential service messages</strong>
                <small>
                  Required for order requests, account security, and delivery
                  communication.
                </small>
              </span>
            </label>
            <label className="consent-row">
              <input type="checkbox" />
              <span>
                <strong>Occasional NEWEIX notes</strong>
                <small>
                  Optional product updates and editorial notes. Never sold to
                  third parties.
                </small>
              </span>
            </label>
            <Link href="/privacy" className="text-link">
              Read the full privacy note <ArrowUpRight size={14} />
            </Link>
          </>
        )}
        {tab === "wallet" && (
          <>
            <span className="eyebrow">Wallet methods</span>
            <h2>Payment methods, not membership.</h2>
            <p className="panel-copy">
              Connect Eixon only through a verified server-side
              provider. Neweix+ membership is separate.
            </p>
            <div className="wallet-methods">
              <div>
                <strong>MFS</strong>
                <span>Not connected</span>
              </div>
              <div>
                <strong>Card</strong>
                <span>Not connected</span>
              </div>
              <div>
                <strong>Eixon</strong>
                <span>Separate financial system</span>
              </div>
            </div>
          </>
        )}
      </section>
    </PageFrame>
  );
}

function OrdersPage() {
  const orders = getOrderRequests();
  return (
    <PageFrame
      eyebrow="Your NEWEIX"
      title="My orders"
      intro="A clear record of every request and its current verification state."
    >
      {orders.length ? (
        <div className="order-list">
          {orders.map(order => (
            <Link
              href={`/orders/${order.id}`}
              className="order-row"
              key={order.id}
            >
              <div>
                <span className="eyebrow">{order.id}</span>
                <strong>
                  {new Date(order.createdAt).toLocaleDateString("en-BD", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </div>
              <div>
                <span>
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items
                </span>
                <strong>{formatBDT(order.subtotal)}</strong>
              </div>
              <div className="order-status">
                Awaiting verification <ArrowUpRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No order requests yet"
          body="When you place an order request, it will appear here with its verification state."
          action={
            <Link href="/shop" className="button button-dark">
              Start browsing
            </Link>
          }
        />
      )}
    </PageFrame>
  );
}
function OrderDetailPage({ id }: { id?: string }) {
  const order = getOrderRequests().find(item => item.id === id);
  if (!order) return <NotFound />;
  return (
    <PageFrame
      eyebrow={`Order request · ${order.id}`}
      title="We have the request"
      intro="This browser has saved your request. It is not a confirmed payment or delivery quote until the configured services verify it."
    >
      <div className="order-detail-layout">
        <section className="order-status-card">
          <div className="order-status-icon">
            <PackageCheck size={24} />
          </div>
          <span className="eyebrow">Current state</span>
          <h2>Awaiting manual verification</h2>
          <p>{order.note}</p>
          <div className="tracking-steps">
            <div className="active">
              <span>01</span>
              <strong>Request received</strong>
              <small>
                Saved {new Date(order.createdAt).toLocaleString("en-BD")}
              </small>
            </div>
            <div>
              <span>02</span>
              <strong>Delivery check</strong>
              <small>Pathao/manual quote pending</small>
            </div>
            <div>
              <span>03</span>
              <strong>Payment verification</strong>
              <small>
                {order.paymentMethod === "Cash on Delivery"
                  ? "Not applicable yet"
                  : "Provider confirmation pending"}
              </small>
            </div>
          </div>
        </section>
        <aside className="summary-card">
          <span className="eyebrow">Delivery details</span>
          <strong>{order.address.name}</strong>
          <p>
            {order.address.phone}
            <br />
            {order.address.line1}
            <br />
            {order.address.union}, {order.address.upazila}
            <br />
            {order.address.district}, {order.address.division}
          </p>
          <div className="summary-rule" />
          <span className="eyebrow">Payment</span>
          <strong>{order.paymentMethod}</strong>
          <p className="summary-note">
            {order.paymentStatus === "awaiting-verification"
              ? "Payment provider verification is still pending."
              : "Cash collection has not been claimed as successful."}
          </p>
          <Link href="/contact" className="button button-outline button-wide">
            Need help? <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </PageFrame>
  );
}

function WishlistPage({ onNotify }: { onNotify: (message: string) => void }) {
  const { wishlist } = useStoreState();
  const savedProducts = products.filter(product =>
    wishlist.includes(product.id)
  );
  return (
    <PageFrame
      eyebrow="Your saved edit"
      title="Wishlist"
      intro="Keep the pieces you are not ready to forget."
    >
      {savedProducts.length ? (
        <div className="product-grid catalog-grid">
          {savedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onNotify={onNotify}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing saved yet"
          body="Tap the heart on anything that feels like yours."
          action={
            <Link href="/shop" className="button button-dark">
              Browse the edit
            </Link>
          }
        />
      )}
    </PageFrame>
  );
}

function ContentPage({
  type,
}: {
  type: "faq" | "contact" | "privacy" | "wallet" | "plus" | "eixverse";
}) {
  const content = {
    faq: {
      eyebrow: "Good to know",
      title: "Frequently asked",
      intro:
        "Straight answers about delivery, payments, and keeping things simple.",
      body: (
        <div className="faq-list">
          {[
            [
              "How does delivery work?",
              "We verify the address hierarchy before sharing a delivery amount. If a live Pathao quote is unavailable for your area, we explain the manual handling path instead of guessing.",
            ],
            [
              "Can I see reviews without an account?",
              "Yes. Reviews are public. An account may be required to submit a review after a verified purchase.",
            ],
            [
              "What payment methods do you support?",
              "Cash on Delivery is the intended guest checkout route, but order submissions remain paused until Shop order operations are ready. Eixon Wallet stays disabled until its Account and Eixon contracts are approved; no external gateway is active.",
            ],
            [
              "Do you deliver outside Dhaka?",
              "Delivery coverage and the final fee are confirmed after your area is checked. Availability may vary; no delivery quote is assumed before verification.",
            ],
            [
              "What is Neweix+?",
              "A membership and editorial benefits layer. It is not a wallet, payment method, or financial system.",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <Plus size={17} />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      ),
    },
    contact: {
      eyebrow: "Talk to us",
      title: "Contact",
      intro:
        "Questions about a product, delivery area, or an order request? We are here.",
      body: (
        <div className="contact-layout">
          <div className="contact-card">
            <Mail size={21} />
            <h2>Send a note</h2>
            <p>
              For order help, include your request ID. For product questions,
              include the name of the object.
            </p>
            <a href="mailto:hello@neweix.com" className="text-link">
              hello@neweix.com <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="contact-card">
            <MapPin size={21} />
            <h2>Dispatch, thoughtfully</h2>
            <p>
              Our dispatch origin may vary by stock and maker. You will see
              manual verification notes before an order is confirmed.
            </p>
            <Link href="/faq" className="text-link">
              Read delivery FAQ <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      ),
    },
    privacy: {
      eyebrow: "A clear promise",
      title: "Privacy & consent",
      intro:
        "We use your information to make the shop work, not to make you feel watched.",
      body: (
        <div className="legal-copy">
          <p>
            NEWEIX should only retain what is needed for account security, order
            requests, delivery communication, and the preferences you choose.
            Customer identity is separate from staff access.
          </p>
          <h2>What we collect</h2>
          <p>
            Account details from the configured auth provider, delivery details
            you submit at checkout, and the minimum technical data needed to
            keep the site secure. Secrets and provider credentials remain
            server-side.
          </p>
          <h2>Your choices</h2>
          <p>
            You can request access, correction, or deletion of personal
            information through the contact channel. Optional editorial messages
            can be turned off at any time.
          </p>
        </div>
      ),
    },
    wallet: {
      eyebrow: "Account feature",
      title: "Wallet",
      intro: "Payment methods belong in your account, not in membership.",
      body: (
        <div className="feature-callout">
          <div className="feature-icon">
            <LockKeyhole size={24} />
          </div>
          <h2>Bring your preferred method.</h2>
          <p>
            Eixon is the approved Neweix ecosystem payment route. The
            appropriate verified provider is connected. Nothing here pretends to
            be a financial balance.
          </p>
          <Link href="/account" className="button button-dark">
            Open account settings <ArrowRight size={15} />
          </Link>
        </div>
      ),
    },
    plus: {
      eyebrow: "Member layer",
      title: "Neweix+",
      intro: "More context around the things worth keeping.",
      body: (
        <div className="feature-callout saffron">
          <span className="eyebrow">Coming with intention</span>
          <h2>Membership, not money.</h2>
          <p>
            Neweix+ can hold member notes, early access, and editorial benefits.
            It is intentionally separate from wallets, payments, and Eixon.
          </p>
          <Link href="/contact" className="button button-dark">
            Ask about Neweix+ <ArrowRight size={15} />
          </Link>
        </div>
      ),
    },
    eixverse: {
      eyebrow: "The wider world",
      title: "eixverse",
      intro: "A space for the people, makers, and ideas behind the edit.",
      body: (
        <div className="feature-callout ink">
          <span className="eyebrow">In the making</span>
          <h2>Objects have a context.</h2>
          <p>
            eixverse is the editorial layer: conversations, maker stories, and
            the slower reasons behind what appears in the shop.
          </p>
          <Link href="/contact" className="button button-outline light-button">
            Get a note when it opens <ArrowRight size={15} />
          </Link>
        </div>
      ),
    },
  }[type];
  return (
    <PageFrame
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
    >
      {content.body}
    </PageFrame>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-mark">✦</div>
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </div>
  );
}

function Storefront() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [catalogNotice, setCatalogNotice] = useState<string | null>(null);
  const [guestCheckoutEnabled, setGuestCheckoutEnabled] = useState(false);
  const [, setCatalogRevision] = useState(0);
  const { cart, wishlist } = useStoreState();
  const auth = useAuth();
  const notify = (message: string) => setNotice(message);

  useEffect(() => {
    let active = true;
    fetchShopStatus()
      .then(enabled => {
        if (active) setGuestCheckoutEnabled(enabled);
      })
      .catch(() => {
        if (active) setGuestCheckoutEnabled(false);
      });
    fetchCatalog()
      .then(remoteProducts => {
        if (!active) return;
        setCatalogProducts(remoteProducts);
        setCatalogNotice(null);
        const available = remoteProducts.flatMap(product =>
          product.variants.map(variant => ({
            productId: product.id,
            variantId: variant.id,
            stock: variant.stock,
          }))
        );
        const nextCart = getCart().flatMap(item => {
          const match = available.find(entry =>
            entry.productId === item.productId && entry.variantId === item.variantId
          );
          if (!match || match.stock < 1) return [];
          return [{ ...item, quantity: Math.min(item.quantity, match.stock) }];
        });
        setCart(nextCart);
        setCatalogRevision(value => value + 1);
      })
      .catch(cause => {
        if (!active) return;
        const code = cause instanceof Error ? cause.message : "";
        const message =
          code === "SHOP_API_NOT_CONFIGURED"
            ? "This preview is intentionally isolated from live Shop data. No staging API is connected, so products, stock, checkout and tracking are unavailable here."
            : code === "SHOP_API_URL_INVALID" ||
                code === "SHOP_API_URL_MUST_USE_HTTPS"
              ? "The configured Shop API endpoint is invalid or does not meet the HTTPS requirement."
              : "The Shop catalogue could not be loaded. No product or stock information is being shown as available.";
        setCatalogNotice(message);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="app-shell">
      <SiteHeader
        onMenu={() => setDrawerOpen(true)}
        cartItems={cart}
        wishlistCount={wishlist.length}
        onNotify={notify}
      />
      <MenuDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userName={auth.user?.name}
        onLogout={() => void auth.logout()}
      />
      {catalogNotice && (
        <div className="page-frame">
          <div className="form-note" role="status">
            {catalogNotice}
          </div>
        </div>
      )}
      <Switch>
        <Route path="/" component={() => <HomePage onNotify={notify} />} />
        <Route path="/shop" component={() => <ShopPage onNotify={notify} />} />
        <Route
          path="/search"
          component={() => <SearchPage onNotify={notify} />}
        />
        <Route path="/product/:slug">
          {params => <ProductPage slug={params.slug} onNotify={notify} />}
        </Route>
        <Route path="/cart" component={() => <CartPage onNotify={notify} />} />
        <Route
          path="/checkout"
          component={() => <CheckoutPage onNotify={notify} guestCheckoutEnabled={guestCheckoutEnabled} />}
        />
        <Route path="/signin" component={() => <AuthPage mode="signin" />} />
        <Route path="/signup" component={() => <AuthPage mode="signup" />} />
        <Route
          path="/forgot-password"
          component={() => <AuthPage mode="forgot" />}
        />
        <Route path="/auth/callback" component={() => <AuthCallback />} />
        <Route
          path="/account"
          component={() => (
            <AccountPage userName={auth.user?.name} onNotify={notify} />
          )}
        />
        <Route path="/track" component={TrackOrderPage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/orders/:id">
          {params => <OrderDetailPage id={params.id} />}
        </Route>
        <Route
          path="/wishlist"
          component={() => <WishlistPage onNotify={notify} />}
        />
        <Route path="/faq" component={() => <ContentPage type="faq" />} />
        <Route
          path="/contact"
          component={() => <ContentPage type="contact" />}
        />
        <Route
          path="/privacy"
          component={() => <ContentPage type="privacy" />}
        />
        <Route path="/wallet" component={() => <ContentPage type="wallet" />} />
        <Route
          path="/neweix-plus"
          component={() => <ContentPage type="plus" />}
        />
        <Route
          path="/eixverse"
          component={() => <ContentPage type="eixverse" />}
        />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
      <footer className="site-footer">
        <div className="footer-top">
          <Logo />
          <p>
            Useful objects, quiet details,
            <br />
            and the small upgrades that last.
          </p>
          <Link href="/shop" className="button button-outline">
            Shop the edit <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="footer-columns">
          <div>
            <span className="eyebrow">Explore</span>
            <Link href="/shop">Shop</Link>
            <Link href="/wishlist">Wishlist</Link>
            <Link href="/neweix-plus">Neweix+</Link>
            <Link href="/eixverse">eixverse</Link>
          </div>
          <div>
            <span className="eyebrow">Support</span>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/track">Track an order</Link>
            <Link href="/privacy">Privacy & consent</Link>
          </div>
          <div>
            <span className="eyebrow">Follow along</span>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <Instagram size={14} /> Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <Facebook size={14} /> Facebook
            </a>
            <a href="mailto:hello@neweix.com">
              <Mail size={14} /> Email us
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 NEWEIX</span>
          <span>Made for modern Bangladesh</span>
          <span>English · বাংলা ready</span>
        </div>
      </footer>
      <MobileNav cartItems={cart} wishlistCount={wishlist.length} />
      {notice && <Toast message={notice} onClose={() => setNotice("")} />}
    </div>
  );
}

function AuthCallback() {
  useEffect(() => {
    // No Account OIDC client is registered for Shop yet. Do not process an
    // unsolicited callback or leave authorization codes/tokens in browser history.
    window.history.replaceState({}, "", window.location.pathname);
  }, []);
  return (
    <PageFrame
      eyebrow="Account access"
      title="Account sign-in is not connected"
      intro="Neweix Account SSO has not been registered and verified for Shop yet. No login session was created from this callback."
    >
      <div className="empty-state">
        <div className="empty-mark">✦</div>
        <h2>Guest shopping is still available</h2>
        <p>
          You can browse the catalogue and use guest checkout where a published
          product is available. Account-only features remain unavailable until
          the approved first-party SSO integration is enabled.
        </p>
        <div className="empty-actions">
          <Link href="/shop" className="button button-dark">
            Continue shopping <ArrowRight size={15} />
          </Link>
          <Link href="/account" className="button button-quiet">
            View account status
          </Link>
        </div>
      </div>
    </PageFrame>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Storefront />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
