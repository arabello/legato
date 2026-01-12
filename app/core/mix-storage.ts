import {
  formatOpenKey,
  isOpenKey,
  openKeyFromString,
  type OpenKey,
} from "./openKey";
import { matchHarmonicRule, type HarmonicRuleDefinition } from "./rules";

const STORAGE_KEY = "legato.mixes";

export type MixTrack = {
  id: string;
  key: OpenKey;
  title: string;
  details: string;
};

export type Mix = {
  id: string;
  name: string;
  startKey: OpenKey;
  tracks: MixTrack[];
  createdAt: number;
};

export type CreateMixOptions = {
  name?: string;
  keys?: Array<string | OpenKey>;
};

const DEFAULT_KEY: OpenKey = openKeyFromString("8a") ?? {
  letter: "m",
  number: 8,
};

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

export function describeTransition(
  previousKey: OpenKey | undefined,
  nextKey: OpenKey,
): HarmonicRuleDefinition | undefined {
  if (!previousKey) {
    return undefined;
  }

  const fromKey = formatOpenKey(previousKey);
  const toKey = formatOpenKey(nextKey);
  return matchHarmonicRule(fromKey, toKey);
}

function normalizeKey(value?: string | OpenKey): OpenKey {
  if (value && typeof value === "object" && isOpenKey(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = openKeyFromString(value);
    if (parsed) {
      return parsed;
    }
  }

  return DEFAULT_KEY;
}

function normalizeKeys(keys?: Array<string | OpenKey>) {
  if (keys && keys.length > 0) {
    return keys.map((entry) => normalizeKey(entry));
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
    tracks: keys.map((key, index) => ({
      id: generateId("track"),
      key,
      title: index === 0 ? "Opening Track" : "",
      details: "",
    })),
  };
}

export function appendTrack(mix: Mix, key: OpenKey): Mix {
  const nextTrack: MixTrack = {
    id: generateId("track"),
    key,
    title: "",
    details: "",
  };

  return { ...mix, tracks: [...mix.tracks, nextTrack] };
}

type StoredTrack = Partial<Omit<MixTrack, "key">> & {
  key?: MixTrack["key"] | string;
  bpm?: unknown;
};

function normalizeTrack(track: StoredTrack, index: number): MixTrack {
  const fallbackTitle = index === 0 ? "Opening Track" : "";
  let details = track.details ?? "";
  if (!details && typeof track.bpm !== "undefined") {
    details = typeof track.bpm === "number" ? `${track.bpm} BPM` : "";
  }

  return {
    id: track.id || generateId("track"),
    key: normalizeKey(track.key),
    title:
      typeof track.title === "string" && track.title.length > 0
        ? track.title
        : fallbackTitle,
    details,
  };
}

function normalizeMix(mix: Partial<Mix>): Mix {
  const tracks: MixTrack[] = [];
  if (Array.isArray(mix.tracks)) {
    mix.tracks.forEach((track, index) => {
      const normalized = normalizeTrack(track, index);
      tracks.push(normalized);
    });
  }

  return {
    id: mix.id || generateId("mix"),
    name:
      typeof mix.name === "string" && mix.name.trim().length > 0
        ? mix.name
        : "Untitled Mix",
    startKey: normalizeKey(mix.startKey ?? tracks[0]?.key),
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

export function removeTrack(mix: Mix, trackId: string): Mix {
  const nextTracks = mix.tracks.filter((track) => track.id !== trackId);
  if (nextTracks.length === mix.tracks.length) {
    return mix;
  }
  return { ...mix, tracks: nextTracks };
}
