import { formatOpenKey, openKeyFromString, type OpenKey } from "./openKey";
import type { Mix } from "./mix-storage";

export type EncodedMixTrack = {
  key: string;
  title?: string;
  details?: string;
};

export type MixSharePayload = {
  name?: string;
  tracks: EncodedMixTrack[];
};

export type DecodedMixSharePayload = {
  name?: string;
  tracks: Array<{ key: OpenKey; title: string; details: string }>;
};

export function encodeMixSharePayload(mix: Mix): string {
  const payload: MixSharePayload = {
    name: mix.name,
    tracks: mix.tracks.map((track) => ({
      key: formatOpenKey(track.key),
      title: track.title || undefined,
      details: track.details || undefined,
    })),
  };

  const json = JSON.stringify(payload);
  const base64 =
    typeof window === "undefined"
      ? Buffer.from(json, "utf-8").toString("base64")
      : window.btoa(encodeURIComponent(json));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeMixSharePayload(
  value: string,
): DecodedMixSharePayload | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const json =
      typeof window === "undefined"
        ? Buffer.from(padded, "base64").toString("utf-8")
        : decodeURIComponent(window.atob(padded));

    const parsed = JSON.parse(json) as MixSharePayload;
    if (!parsed || !Array.isArray(parsed.tracks)) {
      return null;
    }

    const sanitizedTracks = parsed.tracks
      .map((track) => {
        const key = openKeyFromString(track.key);
        if (!key) {
          return null;
        }
        return {
          key,
          title: typeof track.title === "string" ? track.title : "",
          details: typeof track.details === "string" ? track.details : "",
        };
      })
      .filter(
        (track): track is { key: OpenKey; title: string; details: string } =>
          track !== null,
      );

    return {
      name: typeof parsed.name === "string" ? parsed.name : undefined,
      tracks: sanitizedTracks,
    };
  } catch (error) {
    console.error("Failed to decode mix share payload", error);
    return null;
  }
}
