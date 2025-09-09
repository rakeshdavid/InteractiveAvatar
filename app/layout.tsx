import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

import NavBar from "@/components/NavBar";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ToastProvider } from "@/components/ui/Toast";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7559FF",
};

export const metadata: Metadata = {
  title: {
    default: "Interactive AI Avatar Playground",
    template: `%s - Interactive AI Avatar Playground`,
  },
  description: "AI Avatar Interactive Experience - Chat with realistic AI avatars powered by HeyGen",
  keywords: ["AI", "Avatar", "Chat", "Interactive", "HeyGen", "Conversation", "PWA"],
  authors: [{ name: "Rivalista" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/rivalistalogo.svg",
    apple: "/icons/icon-192x192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Avatar Demo",
  },
  openGraph: {
    type: "website",
    title: "Interactive AI Avatar Playground",
    description: "AI Avatar Interactive Experience - Chat with realistic AI avatars",
    siteName: "Interactive AI Avatar Playground",
    images: [
      {
        url: "/RivalistaDemo.png",
        width: 1200,
        height: 800,
        alt: "Interactive AI Avatar Demo - Choose Your Avatar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive AI Avatar Playground",
    description: "AI Avatar Interactive Experience - Chat with realistic AI avatars",
    images: ["/RivalistaDemo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} font-sans dark`}
      lang="en"
    >
      <head />
      <body className="min-h-screen bg-black text-white">
        <ToastProvider>
          <main className="relative flex flex-col gap-6 h-screen w-screen">
            <NavBar />
            {children}
          </main>
          <InstallPrompt />
        </ToastProvider>
      </body>
    </html>
  );
}
