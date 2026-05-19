import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Toko Bubu',
  description: 'Sistem Manajemen Toko Bubu',
  manifest: '/manifest.json', // Mendaftarkan file KTP PWA
};

export const viewport: Viewport = {
  themeColor: '#2563eb', // Mengubah warna bar sinyal/baterai HP di atas menjadi biru
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}