"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "en" | "es" | "pl";

const translations = {
  en: {
    heroTitle: "Western NY's #1 Snow & Lawn Operations Command Center",
    heroSubtitle:
      "Neat Curb delivers crisp, professional property care with a 2–3 inch snow trigger, fast crews, and a modern client experience.",
    ctaPrimary: "Get an Instant Quote",
    ctaSecondary: "View Services",
    trustBadge: "Licensed • Insured • Seasonal Ready",
    servicesTitle: "Core Services",
    servicesSubtitle: "Snow, ice, and warm-season services built for reliability.",
    snowTitle: "Snow & Ice Management",
    snowBody:
      "Residential and commercial snow service with real-time dispatch, smart routing, and transparent surcharges.",
    lawnTitle: "Lawn & Landscape",
    lawnBody:
      "Weekly mowing, mulch refresh, hedge trimming, and seasonal cleanups across Western NY.",
    commercialTitle: "Commercial Reliability",
    commercialBody:
      "Priority scheduling, net-15 invoicing, and compliance-ready reporting for properties at scale.",
    pricingTitle: "Pricing Standard",
    pricingSubtitle: "All snow pricing is anchored to a 2–3 inch trigger.",
    proofTitle: "Why Neat Curb",
    proofSubtitle: "Modern operations with old-school accountability.",
    proofOneTitle: "Fast Dispatch",
    proofOneBody: "Live routing and crew visibility keep every property cleared on time.",
    proofTwoTitle: "Clear Billing",
    proofTwoBody: "Simple pricing, upfront surcharges, and flexible seasonal contracts.",
    proofThreeTitle: "Client Portal",
    proofThreeBody: "Clients see service history, photos, and invoices in one place.",
    coverageTitle: "Service Area",
    coverageBody: "Buffalo, NY and the surrounding Western New York region.",
    footerCTA: "Ready to lock in priority snow service?",
    footerButton: "Start a Contract",
    contactTitle: "Contact",
    contactBody: "229 West Genesee St, Box 106, Buffalo NY 14202 • 716-241-1499"
  },
  es: {
    heroTitle: "El #1 en NY occidental para nieve y césped",
    heroSubtitle:
      "Neat Curb ofrece servicio profesional con un disparador de nieve de 2–3 pulgadas, cuadrillas rápidas y una experiencia moderna para clientes.",
    ctaPrimary: "Cotización instantánea",
    ctaSecondary: "Ver servicios",
    trustBadge: "Licenciado • Asegurado • Temporada lista",
    servicesTitle: "Servicios principales",
    servicesSubtitle: "Nieve, hielo y servicios de temporada cálida confiables.",
    snowTitle: "Manejo de nieve y hielo",
    snowBody:
      "Servicio residencial y comercial con despacho en tiempo real y recargos claros.",
    lawnTitle: "Césped y jardinería",
    lawnBody:
      "Corte semanal, mantillo, setos y limpiezas estacionales en NY occidental.",
    commercialTitle: "Confiabilidad comercial",
    commercialBody:
      "Programación prioritaria, facturación net-15 y reportes para propiedades grandes.",
    pricingTitle: "Estándar de precios",
    pricingSubtitle: "Los precios de nieve se basan en 2–3 pulgadas.",
    proofTitle: "Por qué Neat Curb",
    proofSubtitle: "Operaciones modernas con responsabilidad total.",
    proofOneTitle: "Despacho rápido",
    proofOneBody: "Rutas en vivo y visibilidad de cuadrillas.",
    proofTwoTitle: "Facturación clara",
    proofTwoBody: "Precios simples, recargos transparentes y contratos flexibles.",
    proofThreeTitle: "Portal de clientes",
    proofThreeBody: "Historial de servicio, fotos y facturas en un solo lugar.",
    coverageTitle: "Área de servicio",
    coverageBody: "Buffalo, NY y la región del oeste de Nueva York.",
    footerCTA: "¿Listo para asegurar prioridad de servicio?",
    footerButton: "Iniciar contrato",
    contactTitle: "Contacto",
    contactBody: "229 West Genesee St, Box 106, Buffalo NY 14202 • 716-241-1499"
  },
  pl: {
    heroTitle: "Numer 1 w Zachodnim NY dla sniegu i trawnikow",
    heroSubtitle:
      "Neat Curb zapewnia profesjonalna obsluge z progiem sniegu 2–3 cale, szybkie zalogi i nowoczesna obsluge klienta.",
    ctaPrimary: "Natychmiastowa wycena",
    ctaSecondary: "Zobacz uslugi",
    trustBadge: "Licencjonowani • Ubezpieczeni • Gotowi na sezon",
    servicesTitle: "Glowne uslugi",
    servicesSubtitle: "Niezawodna obsluga sniegu, lodu i sezonu cieplego.",
    snowTitle: "Zarzadzanie sniegiem i lodem",
    snowBody:
      "Uslugi mieszkalne i komercyjne z szybkim wysylaniem ekip i jasnymi doplatami.",
    lawnTitle: "Trawniki i ogrody",
    lawnBody:
      "Cotygodniowe koszenie, sciolka, krzewy i sprzatanie sezonowe.",
    commercialTitle: "Niezawodnosc komercyjna",
    commercialBody:
      "Priorytetowe harmonogramy, faktury net-15 i raporty dla duzych obiektow.",
    pricingTitle: "Standard cenowy",
    pricingSubtitle: "Ceny sniegu oparte na progu 2–3 cale.",
    proofTitle: "Dlaczego Neat Curb",
    proofSubtitle: "Nowoczesne operacje i pelna odpowiedzialnosc.",
    proofOneTitle: "Szybkie wysylki",
    proofOneBody: "Trasy na zywo i widocznosc ekip.",
    proofTwoTitle: "Jasne rozliczenia",
    proofTwoBody: "Proste ceny, jasne doplaty, elastyczne kontrakty.",
    proofThreeTitle: "Portal klienta",
    proofThreeBody: "Historia uslug, zdjecia i faktury w jednym miejscu.",
    coverageTitle: "Obszar uslug",
    coverageBody: "Buffalo, NY oraz okolice Zachodniego Nowego Jorku.",
    footerCTA: "Gotowy na priorytetowa obsluge zimowa?",
    footerButton: "Rozpocznij kontrakt",
    contactTitle: "Kontakt",
    contactBody: "229 West Genesee St, Box 106, Buffalo NY 14202 • 716-241-1499"
  }
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <K extends keyof (typeof translations)["en"]>(key: K) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("neatcurb-language") as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("neatcurb-language", language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage,
      t: (key) => translations[language][key]
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
