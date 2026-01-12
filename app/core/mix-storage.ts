import {
  matchHarmonicRule,
  type HarmonicMood,
  type HarmonicRuleDefinition,
  type HarmonicRuleType,
} from "./rules";

const STORAGE_KEY = "legato.mixes";

export type EnergyLevel = "smooth" | "impact" | "tension";

export type MixTrack = {
  id: string;
  key: string;
  title: string;
  details: string;
  relationship?: string;
  energy?: EnergyLevel;
  label?: string;
  ruleType?: HarmonicRuleType;
  mood?: HarmonicMood;
};

export type Mix = {
  id: string;
  name: string;
  startKey: string;
  tracks: MixTrack[];
  createdAt: number;
};

export type CreateMixOptions = {
  name?: string;
  keys?: string[];
};

export type TrackMeta = {
  relationship?: string;
  label?: string;
  energy?: EnergyLevel;
  ruleType?: HarmonicRuleType;
  mood?: HarmonicMood;
};

const DEFAULT_KEY = "8A";

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

const moodLabels: Record<HarmonicMood, string> = {
  neutral: "Neutral",
  tension: "Tension",
  moodier: "Moodier",
  happier: "Happier",
};

const ruleToEnergy = (rule?: HarmonicRuleDefinition): EnergyLevel => {
  if (!rule) return "smooth";
  if (rule.mood === "tension") return "tension";
  return rule.type === "impact" ? "impact" : "smooth";
};

const ruleLabel = (rule?: HarmonicRuleDefinition) =>
  rule ? moodLabels[rule.mood] : undefined;

const DEFAULT_TRANSITION = {
  relationship: "Start",
  energy: "smooth" as EnergyLevel,
  ruleType: "smooth" as HarmonicRuleType,
  mood: "neutral" as HarmonicMood,
  label: moodLabels.neutral,
};

function describeTransition(previousKey: string | undefined, nextKey: string) {
  if (!previousKey) {
    return DEFAULT_TRANSITION;
  }

  const rule = matchHarmonicRule(previousKey, nextKey);
  return {
    relationship: rule?.name || "Suggested transition",
    energy: ruleToEnergy(rule),
    ruleType: rule?.type ?? "smooth",
    mood: rule?.mood,
    label: ruleLabel(rule),
  };
}

function normalizeKeys(keys?: string[]) {
  if (keys && keys.length > 0) {
    return keys;
  }
  return [DEFAULT_KEY];
}

export function createMixRecord(options?: CreateMixOptions): Mix {
  const keys = normalizeKeys(options?.keys);
  const createdAt = Date.now();

  return {
    id: generateId("mix"),
    name: options?.name?.trim() || "Untitled Mix",
    startKey: keys[0],
    createdAt,
    tracks: keys.map((key, index, list) => {
      const previousKey = list[index - 1];
      const transition = describeTransition(previousKey, key);

      return {
        id: generateId("track"),
        key,
        title: index === 0 ? "Opening Track" : "",
        details: "",
        relationship: transition.relationship,
        energy: transition.energy,
        label: transition.label,
        ruleType: transition.ruleType,
        mood: transition.mood,
      };
    }),
  };
}

export function appendTrack(mix: Mix, key: string, meta?: TrackMeta): Mix {
  const previousKey = mix.tracks.at(-1)?.key;
  const transition = describeTransition(previousKey, key);

  const nextTrack: MixTrack = {
    id: generateId("track"),
    key,
    title: "",
    details: "",
    relationship: meta?.relationship || transition.relationship,
    energy: meta?.energy ?? transition.energy,
    label: meta?.label ?? transition.label,
    ruleType: meta?.ruleType ?? transition.ruleType,
    mood: meta?.mood ?? transition.mood,
  };

  return { ...mix, tracks: [...mix.tracks, nextTrack] };
}

function normalizeTrack(
  track: Partial<MixTrack> & { bpm?: unknown },
  index: number,
): MixTrack {
  const fallbackTitle = index === 0 ? "Opening Track" : "";
  let details = track.details ?? "";
  if (!details && typeof track.bpm !== "undefined") {
    details = typeof track.bpm === "number" ? `${track.bpm} BPM` : "";
  }

  return {
    id: track.id || generateId("track"),
    key: track.key || DEFAULT_KEY,
    title:
      typeof track.title === "string" && track.title.length > 0
        ? track.title
        : fallbackTitle,
    details,
    relationship: track.relationship,
    energy: track.energy as EnergyLevel | undefined,
    label: track.label,
    ruleType: track.ruleType as HarmonicRuleType | undefined,
    mood: track.mood as HarmonicMood | undefined,
  };
}

function normalizeMix(mix: Partial<Mix>): Mix {
  const tracks: MixTrack[] = [];
  if (Array.isArray(mix.tracks)) {
    mix.tracks.forEach((track, index) => {
      const normalized = normalizeTrack(track, index);
      const previous = tracks[index - 1];

      const transition = describeTransition(previous?.key, normalized.key);
      normalized.relationship =
        normalized.relationship || transition.relationship;
      normalized.energy = normalized.energy ?? transition.energy;
      normalized.ruleType = normalized.ruleType ?? transition.ruleType;
      normalized.mood = normalized.mood ?? transition.mood;
      normalized.label = normalized.label || transition.label;

      tracks.push(normalized);
    });
  }

  return {
    id: mix.id || generateId("mix"),
    name:
      typeof mix.name === "string" && mix.name.trim().length > 0
        ? mix.name
        : "Untitled Mix",
    startKey: mix.startKey || tracks[0]?.key || DEFAULT_KEY,
    createdAt: mix.createdAt || Date.now(),
    tracks,
  };
}

export function loadMixes(): Mix[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Mix[];
    if (Array.isArray(parsed)) {
      return parsed.map((mix) => normalizeMix(mix));
    }
  } catch (err) {
    console.error("Failed to load mixes from storage", err);
  }

  return [];
}

export function saveMixes(mixes: Mix[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mixes));
  } catch (err) {
    console.error("Failed to persist mixes", err);
  }
}

export function renameMix(mix: Mix, name: string): Mix {
  return { ...mix, name: name.trim() || "Untitled Mix" };
}

export function updateTrackInfo(
  mix: Mix,
  trackId: string,
  updates: Partial<Pick<MixTrack, "title" | "details">>,
): Mix {
  return {
    ...mix,
    tracks: mix.tracks.map((track) =>
      track.id === trackId ? { ...track, ...updates } : track,
    ),
  };
}
