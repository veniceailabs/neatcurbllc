import crypto from "crypto";

type Serializable = string | number | boolean | null | Serializable[] | { [key: string]: Serializable };

export type AuditRecord = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  meta?: Record<string, Serializable>;
};

const stableStringify = (value: Serializable): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val as Serializable)}`).join(",")}}`;
};

export const sha256Hex = (input: string) =>
  crypto.createHash("sha256").update(input).digest("hex");

export const hashRecord = (record: AuditRecord) =>
  sha256Hex(stableStringify(record));

export const buildMerkleLevels = (leafHashes: string[]) => {
  if (leafHashes.length === 0) {
    return [[sha256Hex("")]];
  }

  const levels: string[][] = [leafHashes];
  let current = leafHashes;

  while (current.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = current[i + 1] ?? current[i];
      next.push(sha256Hex(`${left}${right}`));
    }
    levels.push(next);
    current = next;
  }

  return levels;
};

export const getMerkleRoot = (leafHashes: string[]) => {
  const levels = buildMerkleLevels(leafHashes);
  return levels[levels.length - 1][0];
};

export const createAuditBundle = (records: AuditRecord[]) => {
  const leaves = records.map(hashRecord);
  const levels = buildMerkleLevels(leaves);
  return {
    leaves,
    root: levels[levels.length - 1][0],
    levels
  };
};
