import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // PWA seringkali menggunakan sistem Cache yang agresif (Service Worker).
  // Kita matikan saat mode development agar Anda tidak pusing jika mengubah kode tapi tampilannya tidak berubah.
  disable: process.env.NODE_ENV === "development", 
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Jika Anda punya konfigurasi Next.js sebelumnya, biarkan di sini
  turbopack: {}, // <-- Add this line
};

export default withPWA(nextConfig);