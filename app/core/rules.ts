import { formatOpenKey, openKeyFromString, type OpenKey } from "./openKey";

export type HarmonicMixRule =
  | "maintain"
  | "adjacent-number-uplift"
  | "adjacent-number-downlift"
  | "adjacent-letter-uplift"
  | "adjacent-letter-downlift"
  | "boost-one-semitone"
  | "boost-two-semitone"
  | "parallel-key-minor"
  | "parallel-key-major";

export type HarmonicRuleType = "smooth" | "impact";
export type HarmonicMood = "neutral" | "tension" | "moodier" | "happier";

export type HarmonicRuleDefinition = {
  id: HarmonicMixRule;
  name: string;
  label: string;
  type: HarmonicRuleType;
  mood: HarmonicMood;
  description: string;
  transform: (key: OpenKey) => OpenKey;
};

export type HarmonicSuggestion = {
  id: HarmonicMixRule;
  name: string;
  label: string;
  type: HarmonicRuleType;
  mood: HarmonicMood;
  description: string;
  from: string;
  key: string;
};

const wrapNumber = (value: number): number => {
  const normalized = (((value - 1) % 12) + 12) % 12;
  return normalized + 1;
};

const adjustNumber = (key: OpenKey, delta: number): OpenKey => ({
  ...key,
  number: wrapNumber(key.number + delta),
});

const setLetter = (key: OpenKey, letter: OpenKey["letter"]): OpenKey => ({
  ...key,
  letter,
});

const ruleDefinitions: HarmonicRuleDefinition[] = [
  {
    id: "maintain",
    name: "Maintain",
    label: "same key",
    type: "smooth",
    mood: "neutral",
    description:
      "Identical keys (e.g., 8m → 8m) keep the blend seamless and neutral.",
    transform: (key) => ({ ...key }),
  },
  {
    id: "adjacent-number-uplift",
    name: "Adjacent Number Uplift",
    label: "+1",
    type: "smooth",
    mood: "tension",
    description: "Move one number up (e.g., 8m → 9m) to add drive and tension.",
    transform: (key) => adjustNumber(key, 1),
  },
  {
    id: "adjacent-number-downlift",
    name: "Adjacent Number Downlift",
    label: "-1",
    type: "smooth",
    mood: "moodier",
    description:
      "Move one number down (e.g., 8m → 7m) for a softer, moodier feel.",
    transform: (key) => adjustNumber(key, -1),
  },
  {
    id: "adjacent-letter-uplift",
    name: "Adjacent Letter Uplift",
    label: "m → d",
    type: "smooth",
    mood: "happier",
    description: "Switch minor to relative major (e.g., 8m → 8d) to brighten.",
    transform: (key) => setLetter(key, "d"),
  },
  {
    id: "adjacent-letter-downlift",
    name: "Adjacent Letter Downlift",
    label: "d → m",
    type: "smooth",
    mood: "moodier",
    description: "Switch major to relative minor (e.g., 8d → 8m) to add depth.",
    transform: (key) => setLetter(key, "m"),
  },
  {
    id: "boost-one-semitone",
    name: "Boost One Semitone",
    label: "+7",
    type: "impact",
    mood: "tension",
    description:
      "Jump a semitone (e.g., 8m → 3m) for dramatic, dissonant tension.",
    transform: (key) => adjustNumber(key, 7),
  },
  {
    id: "boost-two-semitone",
    name: "Boost Two Semitone",
    label: "+2",
    type: "impact",
    mood: "tension",
    description:
      "Go up two semitones (e.g., 8m → 10m) for an intense energy spike.",
    transform: (key) => adjustNumber(key, 2),
  },
  {
    id: "parallel-key-minor",
    name: "Parallel Key Minor",
    label: "-3",
    type: "impact",
    mood: "moodier",
    description:
      "Subtract three numbers (e.g., 8d → 5d) to keep majors but darken the tone.",
    transform: (key) => adjustNumber(key, -3),
  },
  {
    id: "parallel-key-major",
    name: "Parallel Key Major",
    label: "+3",
    type: "impact",
    mood: "happier",
    description:
      "Add three numbers (e.g., 8m → 11m) to keep minors but lift the mood.",
    transform: (key) => adjustNumber(key, 3),
  },
];

const ruleMap: Record<HarmonicMixRule, HarmonicRuleDefinition> =
  ruleDefinitions.reduce(
    (acc, rule) => {
      acc[rule.id] = rule;
      return acc;
    },
    {} as Record<HarmonicMixRule, HarmonicRuleDefinition>,
  );

export function getHarmonicRule(id: HarmonicMixRule) {
  return ruleMap[id];
}

export function getHarmonicSuggestions(
  keyString: string,
): HarmonicSuggestion[] {
  const root = openKeyFromString(keyString);
  if (!root) {
    return [];
  }

  const fromLabel = formatOpenKey(root);

  return ruleDefinitions.map((rule) => {
    const target = rule.transform(root);
    const toLabel = formatOpenKey(target);

    return {
      id: rule.id,
      name: rule.name,
      label: rule.label,
      type: rule.type,
      mood: rule.mood,
      description: rule.description,
      from: fromLabel,
      key: toLabel,
    };
  });
}

export function matchHarmonicRule(
  fromKey: string,
  toKey: string,
): HarmonicRuleDefinition | undefined {
  const from = openKeyFromString(fromKey);
  const to = openKeyFromString(toKey);
  if (!from || !to) {
    return undefined;
  }

  return ruleDefinitions.find((rule) => {
    const projected = rule.transform(from);
    return projected.number === to.number && projected.letter === to.letter;
  });
}
