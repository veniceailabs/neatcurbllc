import "./globals.css";
import type { ReactNode } from "react";
import AppProviders from "@/components/app-providers";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Neat Curb LLC",
  url: "https://www.neatcurbllc.com",
  description:
    "Snow removal and property maintenance in Western New York with reliable seasonal and commercial service.",
  areaServed: ["Buffalo, NY", "Western New York"],
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

export const metadata = {
  title: {
    default: "Neat Curb",
    template: "%s | Neat Curb"
  },
  description: "Unified operations dashboard for Neat Curb LLC."
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
      </body>
    </html>
  );
}
