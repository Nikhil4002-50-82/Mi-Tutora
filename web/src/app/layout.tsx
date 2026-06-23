import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mitutora.com'),
  title: {
    default: "Mi Tutora - Transforming Education in India",
    template: "%s | Mi Tutora",
  },
  description: "India's fastest-growing platform connecting students with highly qualified, background-verified tutors for offline and online classes.",
  keywords: ["online tutoring India", "home tuition", "private tutors", "verified educators", "online classes", "CBSE", "ICSE", "State Board", "NEET", "JEE"],
  authors: [{ name: "Mi Tutora" }],
  creator: "Mi Tutora",
  publisher: "Mi Tutora",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Mi Tutora - Transforming Education in India",
    description: "Connect with highly qualified tutors for offline and online classes.",
    url: "https://mitutora.com",
    siteName: "Mi Tutora",
    images: [
      {
        url: "/imports/logo.png",
        width: 800,
        height: 600,
        alt: "Mi Tutora Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mi Tutora - Transforming Education",
    description: "India's fastest-growing platform connecting students with top tutors.",
    images: ["/imports/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Mi Tutora",
    "url": "https://mitutora.com",
    "logo": "https://mitutora.com/imports/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-7483034168",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"]
    }
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white">
        {children}
        <Toaster position="top-right" richColors expand={true} />
      </body>
    </html>
  );
}
