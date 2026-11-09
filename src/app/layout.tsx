import type { Metadata, Viewport } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { DirectionProvider } from "@/components/providers/direction-provider";
import { ErrorBoundary } from "@/components/providers/error-boundary";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#059669",
};

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "منصة الفهم القرائي - مدرسة الساحل الأهلية (بنين)",
  description:
    "منصة تفاعلية لقياس وتنمية مهارات الفهم القرائي لدى طلاب مدرسة الساحل الأهلية (بنين) من الصف الأول الابتدائي حتى الثالث الثانوي.",
  keywords: [
    "الفهم القرائي",
    "مدرسة الساحل الأهلية",
    "السعودية",
    "تعليم",
    "اختبارات",
    "تحسين القراءة",
  ],
  authors: [{ name: "مدرسة الساحل الأهلية (بنين)" }],
  icons: {
    icon: "/school-logo.png",
    apple: "/school-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${tajawal.variable} font-cairo antialiased bg-background text-foreground min-h-screen`}
      >
        <ErrorBoundary>
          <DirectionProvider>
            {children}
          </DirectionProvider>
        </ErrorBoundary>
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}
