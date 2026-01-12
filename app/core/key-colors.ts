const keyColors: Record<string, string> = {
  "1m": "#FF1AF1",
  "2m": "#B85FFF",
  "3m": "#068CFF",
  "4m": "#00CDFF",
  "5m": "#00EBE9",
  "6m": "#00D989",
  "7m": "#00FF00",
  "8m": "#70FF00",
  "9m": "#FFD400",
  "10m": "#FF8500",
  "11m": "#FF5500",
  "12m": "#FF2F3E",
  "1d": "#FF1AF1",
  "2d": "#B85FFF",
  "3d": "#068CFF",
  "4d": "#00CDFF",
  "5d": "#00EBE9",
  "6d": "#00D989",
  "7d": "#00FF00",
  "8d": "#70FF00",
  "9d": "#FFD400",
  "10d": "#FF8500",
  "11d": "#FF5500",
  "12d": "#FF2F3E",
};

const camelotToOpenMap: Record<string, string> = {
  a: "m",
  b: "d",
};

const normalizeKey = (keyName: string): string | null => {
  const trimmed = keyName.trim().toLowerCase();
  const match = trimmed.match(/^(1[0-2]|[1-9])([abmd])$/);
  if (!match) {
    return null;
  }

  const [, number, letter] = match;
  const normalizedLetter = camelotToOpenMap[letter] ?? letter;
  return `${number}${normalizedLetter}`;
};

export function getKeyColor(keyName: string): string {
  const normalized = normalizeKey(keyName);
  if (!normalized) {
    return "#9ca3af";
  }
  return keyColors[normalized] ?? "#9ca3af";
}
