import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
