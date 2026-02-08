export type PropertyClass = "residential" | "commercial";
export type ServiceType = "per_push" | "seasonal";
export type Accumulation = "2-3" | "3-6" | "6-12" | "12+";
export type ResidentialSize = "small" | "medium" | "large";
export type CommercialSize = "small" | "plaza";

export type QuoteInput = {
  propertyClass: PropertyClass;
  serviceType: ServiceType;
  size: ResidentialSize | CommercialSize;
  accumulation: Accumulation;
  addOns: {
    sidewalk: boolean;
    ice: boolean;
    driftReturn: boolean;
  };
};

export type Range = { low: number; high: number };
export type QuoteLine = { label: string; range: Range; note?: string };
export type PublicService =
  | "Snow Removal"
  | "Lawn Care"
  | "Property Maintenance"
  | "Commercial Services";

export type PublicQuoteInput = {
  service: PublicService;
  propertyClass?: PropertyClass;
  size?: ResidentialSize | CommercialSize;
  accumulation?: Accumulation;
};

const RES_PER_PUSH: Record<ResidentialSize, Range> = {
  small: { low: 70, high: 70 },
  medium: { low: 85, high: 85 },
  large: { low: 100, high: 120 }
};

const RES_SEASONAL: Record<ResidentialSize, Range> = {
  small: { low: 800, high: 1000 },
  medium: { low: 1000, high: 1300 },
  large: { low: 1300, high: 1700 }
};

const COMM_PER_PUSH: Record<CommercialSize, Range> = {
  small: { low: 150, high: 275 },
  plaza: { low: 275, high: 750 }
};

const COMM_SEASONAL: Record<CommercialSize, Range> = {
  small: { low: 4500, high: 7500 },
  plaza: { low: 10000, high: 22000 }
};

const SURCHARGE_RATE: Record<Accumulation, number> = {
  "2-3": 0,
  "3-6": 0.5,
  "6-12": 0.75,
  "12+": 1
};

const ADD_ONS = {
  sidewalk: { low: 40, high: 40 },
  ice: { low: 75, high: 75 },
  driftResidential: { low: 70, high: 120 },
  driftCommercial: { low: 150, high: 500 }
};

const addRanges = (a: Range, b: Range): Range => ({
  low: a.low + b.low,
  high: a.high + b.high
});

const multiplyRange = (a: Range, factor: number): Range => ({
  low: Math.round(a.low * factor),
  high: Math.round(a.high * factor)
});

export function getSnowQuote(input: QuoteInput) {
  const lines: QuoteLine[] = [];
  const notes: string[] = [];

  const isResidential = input.propertyClass === "residential";
  const isPerPush = input.serviceType === "per_push";

  let base: Range;
  if (isResidential) {
    base = isPerPush
      ? RES_PER_PUSH[input.size as ResidentialSize]
      : RES_SEASONAL[input.size as ResidentialSize];
  } else {
    base = isPerPush
      ? COMM_PER_PUSH[input.size as CommercialSize]
      : COMM_SEASONAL[input.size as CommercialSize];
  }

  lines.push({
    label: isPerPush ? "Base snow service" : "Seasonal contract",
    range: base,
    note: isPerPush ? "2-3 inch trigger" : "Unlimited seasonal coverage"
  });

  let addOnTotal: Range = { low: 0, high: 0 };

  if (isPerPush) {
    if (input.addOns.sidewalk && isResidential) {
      addOnTotal = addRanges(addOnTotal, ADD_ONS.sidewalk);
      lines.push({ label: "Sidewalk clearing", range: ADD_ONS.sidewalk });
    }

    if (input.addOns.ice) {
      addOnTotal = addRanges(addOnTotal, ADD_ONS.ice);
      lines.push({ label: "Ice management", range: ADD_ONS.ice });
    }

    if (input.addOns.driftReturn) {
      const driftRange = isResidential
        ? ADD_ONS.driftResidential
        : ADD_ONS.driftCommercial;
      lines.push({
        label: "Drift return visit",
        range: driftRange,
        note: "If required after initial clearing"
      });
      addOnTotal = addRanges(addOnTotal, driftRange);
    }
  } else {
    notes.push("Add-ons are quoted separately for seasonal contracts.");
  }

  const surchargeRate = isPerPush ? SURCHARGE_RATE[input.accumulation] : 0;
  const surchargeBase = addRanges(base, addOnTotal);
  const surcharge = multiplyRange(surchargeBase, surchargeRate);

  if (surchargeRate > 0) {
    lines.push({
      label: `Heavy snow surcharge (${Math.round(surchargeRate * 100)}%)`,
      range: surcharge
    });
  }

  let total = addRanges(addRanges(base, addOnTotal), surcharge);

  if (!isResidential) {
    notes.push("Commercial base pricing includes parking and sidewalks.");
  }

  return {
    lines,
    total,
    surchargeRate,
    notes
  };
}

export function getPublicEstimate(input: PublicQuoteInput): Range {
  if (input.service === "Snow Removal") {
    const quote = getSnowQuote({
      propertyClass: input.propertyClass ?? "residential",
      serviceType: "per_push",
      size: (input.size ?? "medium") as ResidentialSize | CommercialSize,
      accumulation: input.accumulation ?? "2-3",
      addOns: { sidewalk: true, ice: false, driftReturn: false }
    });
    return quote.total;
  }

  if (input.service === "Lawn Care") {
    return { low: 70, high: 85 };
  }

  if (input.service === "Property Maintenance") {
    return { low: 150, high: 400 };
  }

  return { low: 400, high: 1500 };
}
