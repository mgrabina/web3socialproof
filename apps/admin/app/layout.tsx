import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { env, getPixelServerByEnvironment } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Talaria Protocol",
  description: "The ultimate marketing tool to increase conversions in web3",
};

const apiKey = "sk_test_51hGXLs7gUOVBHKGjehbwK2kNo9BoJanNX";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          src={`${getPixelServerByEnvironment(env)}/static/script.min.js?env=${env}&apiKey=${apiKey}`}
          async
        ></script>
      </head>
      {/* Required for pricing table */}
      <script
        async
        src="https://js.stripe.com/v3/pricing-table.js"
        defer
      ></script>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
