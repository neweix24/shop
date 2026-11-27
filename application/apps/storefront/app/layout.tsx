import type { Metadata, Viewport } from "next";
import "../src/legacy/index.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.shop.neweix.com"),
  title: { default: "Neweix Shop", template: "%s | Neweix Shop" },
  description: "The official Neweix online store.",
  applicationName: "Neweix Shop",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07152f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
