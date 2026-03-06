import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import AppProviders from "@/components/app-providers";
import { SITE } from "@/lib/site";

const SITE_URL = "https://www.neatcurbllc.com";
const BRAND_NAME = "Neat Curb LLC";
const DEFAULT_DESCRIPTION =
  "NYS MBE-certified snow removal, lawn care, and property maintenance for residential and commercial properties across Western New York.";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#localbusiness`,
  name: BRAND_NAME,
  legalName: BRAND_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/brand/neat-curb-logo.png`,
  logo: `${SITE_URL}/brand/neat-curb-logo.png`,
  hasMap: "https://maps.google.com/?q=229+West+Genesee+St+Buffalo+NY+14202",
  geo: {
    "@type": "GeoCoordinates",
    latitude: 42.8864,
    longitude: -78.8784
  },
  description: DEFAULT_DESCRIPTION,
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
    "Property maintenance",
    "Landscape design and installation"
  ],
  knowsAbout: [
    "NAICS 561730",
    "Residential groundskeeping",
    "Commercial property maintenance",
    "Seasonal cleanup",
    "Snow plow services"
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
  telephone: "+1-716-241-1499",
  email: "neatcurb@gmail.com",
  sameAs: [SITE.instagram.url, SITE.dot.url],
  additionalType: "https://www.naics.com/naics-code-description/?code=561730",
  identifier: {
    "@type": "PropertyValue",
    propertyID: "NAICS",
    value: "561730"
  },
  priceRange: "$$",
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

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: BRAND_NAME,
  inLanguage: ["en-US", "es-US"],
  publisher: {
    "@type": "Organization",
    name: BRAND_NAME,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/brand/neat-curb-logo.png`
    }
  }
};

export const metadata: Metadata = {
  applicationName: BRAND_NAME,
  title: {
    default: `${BRAND_NAME} | WNY Snow, Lawn & Property Maintenance`,
    template: `%s | ${BRAND_NAME}`
  },
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  keywords: [
    "NYS MBE landscaping",
    "WNY snow removal",
    "Buffalo lawn care",
    "property maintenance Western New York",
    "commercial snow plowing Buffalo",
    "seasonal cleanup services"
  ],
  category: "Business",
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: "/brand/neat-curb-logo.png",
    shortcut: "/brand/neat-curb-logo.png",
    apple: "/brand/neat-curb-logo.png"
  },
  openGraph: {
    title: `${BRAND_NAME} | WNY Snow, Lawn & Property Maintenance`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: BRAND_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/brand/neat-curb-logo-full.png",
        width: 512,
        height: 512,
        alt: "Neat Curb logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} | WNY Snow, Lawn & Property Maintenance`,
    description: DEFAULT_DESCRIPTION,
    images: ["/brand/neat-curb-logo-full.png"]
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
