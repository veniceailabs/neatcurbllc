import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import AppProviders from "@/components/app-providers";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Neat Curb LLC",
  url: "https://www.neatcurbllc.com",
  hasMap: "https://maps.google.com/?q=229+West+Genesee+St+Buffalo+NY+14202",
  geo: {
    "@type": "GeoCoordinates",
    latitude: 42.8864,
    longitude: -78.8784
  },
  description:
    "Snow removal and property maintenance in Western New York with reliable seasonal and commercial service.",
  areaServed: [
    {
      "@type": "City",
      name: "Buffalo",
      geo: { "@type": "GeoCoordinates", latitude: 42.8864, longitude: -78.8784 }
    },
    {
      "@type": "City",
      name: "Amherst",
      geo: { "@type": "GeoCoordinates", latitude: 42.9785, longitude: -78.7998 }
    },
    {
      "@type": "City",
      name: "Cheektowaga",
      geo: { "@type": "GeoCoordinates", latitude: 42.9034, longitude: -78.7548 }
    },
    {
      "@type": "City",
      name: "Tonawanda",
      geo: { "@type": "GeoCoordinates", latitude: 43.0209, longitude: -78.8798 }
    },
    {
      "@type": "City",
      name: "West Seneca",
      geo: { "@type": "GeoCoordinates", latitude: 42.8501, longitude: -78.7998 }
    },
    {
      "@type": "City",
      name: "Niagara Falls",
      geo: { "@type": "GeoCoordinates", latitude: 43.0962, longitude: -79.0377 }
    },
    {
      "@type": "GeoShape",
      name: "Western New York Coverage Zone",
      polygon:
        "43.20 -79.20 43.20 -78.45 42.60 -78.45 42.60 -79.20 43.20 -79.20"
    }
  ],
  serviceType: [
    "Snow removal",
    "Ice management",
    "Lawn maintenance",
    "Leaf cleanup",
    "Property maintenance"
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "229 West Genesee St",
    postOfficeBoxNumber: "Box 106",
    addressLocality: "Buffalo",
    addressRegion: "NY",
    postalCode: "14202",
    addressCountry: "US"
  },
  telephone: "716-241-1499",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      opens: "07:30",
      closes: "17:30"
    }
  ]
};

export const metadata: Metadata = {
  applicationName: "Neat Curb",
  title: {
    default: "Neat Curb",
    template: "%s | Neat Curb"
  },
  description: "Unified operations dashboard for Neat Curb LLC.",
  metadataBase: new URL("https://neatcurbllc.com"),
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: "/brand/neat-curb-logo.svg",
    shortcut: "/brand/neat-curb-logo.svg",
    apple: "/brand/neat-curb-logo.svg"
  },
  openGraph: {
    title: "Neat Curb",
    description: "Western New York snow, lawn, and property maintenance.",
    url: "https://neatcurbllc.com",
    siteName: "Neat Curb",
    type: "website",
    images: [
      {
        url: "/brand/neat-curb-logo.svg",
        width: 512,
        height: 512,
        alt: "Neat Curb logo"
      }
    ]
  }
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
