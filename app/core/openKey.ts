// Open Key notation type
export type OpenKey = {
  letter: "d" | "m"; // d for major, m for minor
  number: number; // 1-12
};

// Type guard to check if an object is an OpenKey
export function isOpenKey(key: unknown): key is OpenKey {
  if (!key || typeof key !== "object") return false;

  const candidate = key as Record<string, unknown>;

  return (
    "letter" in candidate &&
    "number" in candidate &&
    (candidate.letter === "d" || candidate.letter === "m") &&
    typeof candidate.number === "number" &&
    candidate.number >= 1 &&
    candidate.number <= 12
  );
}

export function openKeyFromString(keyString: string): OpenKey | undefined {
  if (!keyString || typeof keyString !== "string" || keyString.length > 3) {
    return undefined;
  }

  const match = keyString.match(/^(\d+)([dm])$/);
  if (!match) {
    return undefined;
  }

  const number = parseInt(match[1], 10);
  if (number < 1 || number > 12) {
    return undefined;
  }

  const key = {
    letter: match[2] as "d" | "m",
    number,
  };

  if (!isOpenKey(key)) {
    return undefined;
  }

  return key;
}

// Generate all possible root keys
export function generateAllRootKeys(): OpenKey[] {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const letters: ("m" | "d")[] = ["m", "d"];

  const result: OpenKey[] = [];

  for (const letter of letters) {
    for (const number of numbers) {
      result.push({ letter, number });
    }
  }

  return result;
}

// Utility function to format an OpenKey as a string
export function formatOpenKey(key: OpenKey): string {
  return `${key.number}${key.letter}`;
}
