export type ProductVariant = {
  id: string;
  label: string;
  stock: number;
  price: number;
  compareAt?: number;
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  date: string;
  title: string;
  body: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  eyebrow: string;
  description: string;
  details: string[];
  image: string;
  gallery: string[];
  color: string;
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  tags: string[];
  featured?: boolean;
  editorial?: string;
};

const image = (id: string, width = 1100) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=88`;

export const products: Product[] = [
  {
    id: "nx-001",
    slug: "arc-desk-lamp",
    name: "Arc desk lamp",
    category: "Desk",
    eyebrow: "Light, considered",
    description:
      "A sculptural, dimmable desk light for the hour between work and everything else.",
    details: [
      "Powder-coated steel",
      "Three-stage dimmer",
      "USB-C power",
      "Designed in Dhaka",
    ],
    image: image("photo-1507473885765-e6ed057f782c"),
    gallery: [
      image("photo-1507473885765-e6ed057f782c"),
      image("photo-1494438639946-1ebd1d20bf85"),
      image("photo-1524758631624-e2822e304c36"),
    ],
    color: "Ink / bone",
    variants: [
      {
        id: "standard",
        label: "Standard",
        stock: 18,
        price: 4850,
        compareAt: 5600,
      },
    ],
    rating: 4.8,
    reviewCount: 32,
    reviews: [
      {
        id: "r1",
        name: "Nadia R.",
        rating: 5,
        date: "2 weeks ago",
        title: "A beautiful desk reset",
        body: "The light is warm and the dimmer makes late work feel much less harsh.",
      },
    ],
    tags: ["new", "desk", "design"],
    featured: true,
    editorial: "Good light changes the shape of a day.",
  },
  {
    id: "nx-002",
    slug: "canvas-weekender",
    name: "Canvas weekender",
    category: "Carry",
    eyebrow: "Pack a little lighter",
    description:
      "A compact cotton-canvas carryall with a reinforced base and room for an unplanned night away.",
    details: [
      "18oz washed canvas",
      "Vegetable-tanned leather handles",
      "Interior laptop sleeve",
      "34L capacity",
    ],
    image: image("photo-1553062407-98eeb64c6a62"),
    gallery: [
      image("photo-1553062407-98eeb64c6a62"),
      image("photo-1548036328-c9fa89d128fa"),
      image("photo-1556306535-0f09a537f0a3"),
    ],
    color: "Moss",
    variants: [
      { id: "moss", label: "Moss", stock: 9, price: 6200, compareAt: 7100 },
      { id: "ink", label: "Ink", stock: 6, price: 6200, compareAt: 7100 },
    ],
    rating: 4.7,
    reviewCount: 18,
    reviews: [
      {
        id: "r2",
        name: "Afsar H.",
        rating: 5,
        date: "1 month ago",
        title: "Good proportions",
        body: "Fits under a seat and still looks pulled together when it is full.",
      },
    ],
    tags: ["carry", "travel", "new"],
    featured: true,
    editorial: "For the plans that start after Friday.",
  },
  {
    id: "nx-003",
    slug: "linen-throw",
    name: "Linen throw",
    category: "Home",
    eyebrow: "A softer room",
    description:
      "Washed linen with a dry hand and a little weight, made for sofas, balconies, and slow mornings.",
    details: [
      "100% European linen",
      "140 × 200 cm",
      "Machine washable",
      "Low-impact dye",
    ],
    image: image("photo-1505693416388-ac5ce068fe85"),
    gallery: [
      image("photo-1505693416388-ac5ce068fe85"),
      image("photo-1618220179428-22790b461013"),
      image("photo-1595526114035-0d45ed16cfbf"),
    ],
    color: "Clay",
    variants: [
      { id: "clay", label: "Clay", stock: 14, price: 3850 },
      { id: "oat", label: "Oat", stock: 11, price: 3850 },
    ],
    rating: 4.9,
    reviewCount: 41,
    reviews: [
      {
        id: "r3",
        name: "Tania S.",
        rating: 5,
        date: "3 months ago",
        title: "The texture is everything",
        body: "It has that effortless lived-in look without feeling thin.",
      },
    ],
    tags: ["home", "textile"],
    featured: true,
    editorial: "A quiet layer for the corner you keep returning to.",
  },
  {
    id: "nx-004",
    slug: "daily-notebook",
    name: "Daily notebook",
    category: "Desk",
    eyebrow: "Make space for the next thought",
    description:
      "A lay-flat, dot-grid notebook with a durable cover and 160 pages for lists, sketches, and small plans.",
    details: [
      "160 dot-grid pages",
      "FSC-certified paper",
      "Lay-flat binding",
      "A5 format",
    ],
    image: image("photo-1544816155-12df9643f363"),
    gallery: [
      image("photo-1544816155-12df9643f363"),
      image("photo-1517842645767-c639042777db"),
      image("photo-1499750310107-5fef28a66643"),
    ],
    color: "Saffron",
    variants: [
      {
        id: "saffron",
        label: "Saffron",
        stock: 44,
        price: 780,
        compareAt: 950,
      },
      { id: "ink", label: "Ink", stock: 28, price: 780, compareAt: 950 },
    ],
    rating: 4.6,
    reviewCount: 57,
    reviews: [
      {
        id: "r4",
        name: "Rafi K.",
        rating: 4,
        date: "5 days ago",
        title: "A very good everyday notebook",
        body: "The paper takes a gel pen cleanly and the cover feels more premium than the price.",
      },
    ],
    tags: ["desk", "paper", "gift"],
    featured: true,
    editorial: "The best tools leave room for you.",
  },
  {
    id: "nx-005",
    slug: "stoneware-mug-set",
    name: "Stoneware mug set",
    category: "Home",
    eyebrow: "The daily ritual",
    description:
      "Two hand-finished stoneware mugs with a thumb-friendly handle and a quiet glaze.",
    details: [
      "Set of two",
      "Dishwasher safe",
      "Microwave safe",
      "Approx. 320ml each",
    ],
    image: image("photo-1514228742587-6b1558fcca3d"),
    gallery: [
      image("photo-1514228742587-6b1558fcca3d"),
      image("photo-1495474472287-4d71bcdd2085"),
      image("photo-1501339847302-ac426a4a7cbb"),
    ],
    color: "Milk / ink",
    variants: [{ id: "milk-ink", label: "Milk / ink", stock: 24, price: 2400 }],
    rating: 4.8,
    reviewCount: 29,
    reviews: [
      {
        id: "r5",
        name: "Maliha J.",
        rating: 5,
        date: "2 months ago",
        title: "Lovely weight",
        body: "The glaze catches the light and the handle is genuinely comfortable.",
      },
    ],
    tags: ["home", "kitchen", "gift"],
  },
  {
    id: "nx-006",
    slug: "everyday-cap",
    name: "Everyday cap",
    category: "Wear",
    eyebrow: "One good thing to wear",
    description:
      "An unstructured cotton cap with a low profile, soft brim, and an adjustable brass clasp.",
    details: [
      "100% cotton twill",
      "Unstructured crown",
      "Brass adjuster",
      "Unisex fit",
    ],
    image: image("photo-1521369909029-2afed882baee"),
    gallery: [
      image("photo-1521369909029-2afed882baee"),
      image("photo-1588850561407-ed78c282e89b"),
      image("photo-1575428652377-a2d80e2277fc"),
    ],
    color: "Olive",
    variants: [
      { id: "olive", label: "Olive", stock: 31, price: 1550 },
      { id: "bone", label: "Bone", stock: 19, price: 1550 },
    ],
    rating: 4.5,
    reviewCount: 16,
    reviews: [
      {
        id: "r6",
        name: "Samiul A.",
        rating: 5,
        date: "2 weeks ago",
        title: "The easy one",
        body: "Looks good with everything and does not feel too structured.",
      },
    ],
    tags: ["wear", "new"],
  },
  {
    id: "nx-007",
    slug: "travel-pouch",
    name: "Travel pouch",
    category: "Carry",
    eyebrow: "Keep the small things together",
    description:
      "A water-resistant zip pouch for chargers, small tools, or the things you never want loose in your bag.",
    details: [
      "Recycled ripstop nylon",
      "Water-resistant finish",
      "YKK zip",
      "20 × 14 cm",
    ],
    image: image("photo-1556228453-efd6c1ff04f6"),
    gallery: [
      image("photo-1556228453-efd6c1ff04f6"),
      image("photo-1512436991641-6745cdb1723f"),
      image("photo-1566150905458-1bf1fc113f0d"),
    ],
    color: "Cobalt",
    variants: [
      { id: "cobalt", label: "Cobalt", stock: 22, price: 980, compareAt: 1200 },
      {
        id: "saffron",
        label: "Saffron",
        stock: 12,
        price: 980,
        compareAt: 1200,
      },
    ],
    rating: 4.7,
    reviewCount: 22,
    reviews: [
      {
        id: "r7",
        name: "Farhan M.",
        rating: 4,
        date: "1 month ago",
        title: "Simple and useful",
        body: "The zip feels sturdy and the bright lining makes small things easy to find.",
      },
    ],
    tags: ["carry", "travel", "gift"],
  },
  {
    id: "nx-008",
    slug: "minimal-wall-clock",
    name: "Minimal wall clock",
    category: "Home",
    eyebrow: "A little more time",
    description:
      "A silent-sweep wall clock with a slim oak frame and a face that keeps the room feeling open.",
    details: [
      "Silent quartz movement",
      "Oak veneer frame",
      "30 cm diameter",
      "Battery included",
    ],
    image: image("photo-1563861826100-9cb868fdbe1c"),
    gallery: [
      image("photo-1563861826100-9cb868fdbe1c"),
      image("photo-1494438639946-1ebd1d20bf85"),
      image("photo-1505693416388-ac5ce068fe85"),
    ],
    color: "Oak / ink",
    variants: [{ id: "oak", label: "Oak / ink", stock: 7, price: 2950 }],
    rating: 4.6,
    reviewCount: 11,
    reviews: [
      {
        id: "r8",
        name: "Ishrat T.",
        rating: 5,
        date: "4 months ago",
        title: "Exactly as pictured",
        body: "Quiet and nicely made. It disappears into the room in the best way.",
      },
    ],
    tags: ["home", "new"],
  },
];

export const categories = ["All", "New In", "Desk", "Home", "Carry", "Wear"];

export function getProduct(slug: string | undefined) {
  return products.find(product => product.slug === slug);
}

export function getVariant(product: Product, variantId?: string) {
  return (
    product.variants.find(variant => variant.id === variantId) ??
    product.variants[0]
  );
}

export function discountPercent(variant: ProductVariant) {
  if (!variant.compareAt || variant.compareAt <= variant.price) return 0;
  return Math.round(
    ((variant.compareAt - variant.price) / variant.compareAt) * 100
  );
}

export function searchProducts(query: string, category = "All") {
  const normalized = query.trim().toLowerCase();
  return products.filter(product => {
    const categoryMatch =
      category === "All" ||
      (category === "New In"
        ? product.tags.includes("new")
        : product.category === category);
    if (!categoryMatch) return false;
    if (!normalized) return true;
    return [
      product.name,
      product.category,
      product.description,
      product.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized);
  });
}

export function formatBDT(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);
}
