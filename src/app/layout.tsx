import type { Metadata } from "next";
import { AuthProvider } from "./Providers";

// Import Google Fonts through Next.js
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// Configure the Sans font
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

// Configure the Serif font
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "KapiKitab",
  description: "The next generation of interactive learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased text-stone-800 bg-[#FDFCF8] selection:bg-emerald-100">
        {/* We wrap the entire app in the AuthProvider here */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}