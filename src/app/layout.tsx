import type { Metadata } from "next";
import { Inter, Manrope, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Guru — Semua Administrasi Guru, Dalam Satu Aplikasi",
  description:
    "Sistem Guru adalah aplikasi administrasi terpadu untuk guru. Kelola kelas, siswa, absensi, jurnal mengajar, perangkat pembelajaran, bahan ajar, dan penilaian dalam satu platform.",
  keywords: ["sistem guru", "administrasi guru", "absensi siswa", "jurnal mengajar", "penilaian siswa"],
  authors: [{ name: "Sistem Guru" }],
  openGraph: {
    title: "Sistem Guru",
    description: "Semua Administrasi Guru, Dalam Satu Aplikasi.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${manrope.variable} ${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
