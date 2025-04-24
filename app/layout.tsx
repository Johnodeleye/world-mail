import type { Metadata } from "next";
import { Merienda, Spectral } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// Font configurations
const spectral = Merienda({
  subsets: ["latin"],

});


export const metadata: Metadata = {
  title: {
    default: "Rotary New World Foundation",
    template: "%s | Rotary New World Foundation"
  },
  description: "Empowering children, young people and communities to tackle discrimination and vulnerability.",
  keywords: ["humanitarian", "South Sudan", "children", "Rotary", "nonprofit"],
  authors: [{ name: "Rotary New World Foundation" }],
  creator: "Rotary New World Foundation",
  publisher: "Rotary New World Foundation",
  metadataBase: new URL("https://www.rtnewworld.com"),
  openGraph: {
    title: "Rotary New World Foundation",
    description: "Striving for a just world where we are all equal",
    url: "https://www.rtnewworld.com",
    siteName: "Rotary New World Foundation",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotary New World Foundation",
    description: "Empowering children and communities for a just world",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spectral.className}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0d404f" />
      </head>
      <body className={`${spectral.className} antialiased bg-white text-[#0d404f]`}>
      <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#10b981',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 500,
            },
            success: {
              duration: 3000,
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}