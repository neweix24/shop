import Link from "next/link";
import { formatBDT, loadCatalog } from "@/lib/shop-api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const catalog = await loadCatalog();

  return (
    <main>
      <header className="site-header">
        <Link href="/" className="wordmark" aria-label="Neweix Shop home">
          <span className="wordmark-symbol" aria-hidden="true">N</span>
          <span>NEWEIX<span className="wordmark-light">SHOP</span></span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="#catalog">The collection</Link>
          <Link href="#how-it-works">How it works</Link>
        </nav>
        <span className="header-note">Official Neweix store</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> THE NEWEIX COLLECTION</p>
          <h1>Considered things.<br /><em>Chosen to last.</em></h1>
          <p className="hero-description">
            A focused collection from Neweix. Browse what is actually available,
            with current prices and stock supplied by the Shop service.
          </p>
          <div className="hero-actions">
            <Link href="#catalog" className="primary-link">Explore the collection <span aria-hidden="true">↗</span></Link>
            <span className="currency-note">Prices shown in BDT</span>
          </div>
          <div className="hero-footnote">
            <span>01 / SINGLE-VENDOR STORE</span>
            <span>NEWEIX ECOSYSTEM</span>
          </div>
        </div>
        <div className="hero-aside" aria-label="Store principles">
          <div className="aside-topline"><span>01</span><span>THE SHOP STANDARD</span></div>
          <div className="orbit-mark" aria-hidden="true">
            <span className="orbit-ring ring-one" />
            <span className="orbit-ring ring-two" />
            <span className="orbit-core">N</span>
          </div>
          <div className="aside-bottom">
            <p>One store.<br />Clear ownership.<br />Verified availability.</p>
            <span>NEWEIX / 2026</span>
          </div>
        </div>
      </section>

      <section id="catalog" className="catalog-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE LIVE CATALOG</p>
            <h2>Available now<span>.</span></h2>
          </div>
          <p className="section-aside">Only active products with active variants and verified stock are listed.</p>
        </div>

        {catalog.status === "not_configured" && (
          <div className="catalog-state" role="status">
            <span className="state-kicker">PREVIEW / 01</span>
            <h3>Catalog connection not configured</h3>
            <p>
              This Next.js storefront is ready for the Shop API, but no isolated
              API environment has been connected. No production data is requested.
            </p>
          </div>
        )}

        {catalog.status === "unavailable" && (
          <div className="catalog-state" role="status">
            <span className="state-kicker">SERVICE / 02</span>
            <h3>Catalog temporarily unavailable</h3>
            <p>
              The storefront could not verify live catalog data. Product names,
              prices and stock are hidden until the Shop API responds.
            </p>
          </div>
        )}

        {catalog.status === "ready" && catalog.products.length === 0 && (
          <div className="catalog-state" role="status">
            <span className="state-kicker">COLLECTION / 03</span>
            <h3>The collection is being prepared</h3>
            <p>
              The live Shop API is connected, but there are no active products
              available to display yet.
            </p>
          </div>
        )}

        {catalog.status === "ready" && catalog.products.length > 0 && (
          <div className="product-grid">
            {catalog.products.map(product => {
              const lowestPrice = Math.min(...product.variants.map(variant => variant.unitPriceMinor));
              const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
              return (
                <article className="product-card" key={product.id}>
                  <div className="product-placeholder">
                    <span>NEWEIX / OBJECT</span>
                    <strong>{product.title.slice(0, 1).toUpperCase()}</strong>
                  </div>
                  <div className="product-meta">
                    <span>{product.category ?? "NEWEIX SHOP"}</span>
                    <span>{totalStock > 0 ? "IN STOCK" : "SOLD OUT"}</span>
                  </div>
                  <h3>{product.title}</h3>
                  {product.description && <p>{product.description}</p>}
                  <div className="product-price">
                    <strong>{formatBDT(lowestPrice)}</strong>
                    <span>{product.variants.length} option{product.variants.length === 1 ? "" : "s"}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="how-it-works" className="principles-section">
        <p className="eyebrow">A CLEAR WAY TO SHOP</p>
        <div className="principle-grid">
          <article><span>01</span><h3>Real catalog</h3><p>Products appear only after they are published in the Shop database.</p></article>
          <article><span>02</span><h3>Verified stock</h3><p>Availability is calculated by the Shop API, not by browser estimates.</p></article>
          <article><span>03</span><h3>Honest checkout</h3><p>Ordering stays paused until identity, order review and delivery operations are ready.</p></article>
        </div>
      </section>

      <footer className="site-footer">
        <Link href="/" className="wordmark"><span className="wordmark-symbol">N</span><span>NEWEIX<span className="wordmark-light">SHOP</span></span></Link>
        <p>Part of the Neweix ecosystem.</p>
        <span>© NEWEIX / BDT</span>
      </footer>
    </main>
  );
}
