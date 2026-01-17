import type { OpenKey } from "./openKey";

export type NmlTrack = {
  title: string;
  artist: string;
  bpm: number | undefined;
  key: OpenKey | undefined;
};

export type NmlPlaylist = {
  name: string;
  tracks: NmlTrack[];
};

/**
 * Traktor's MUSICAL_KEY VALUE (0-23) maps to musical keys.
 * This table converts those values to Open Key notation (Camelot wheel).
 */
const TRAKTOR_KEY_TO_OPEN_KEY: Record<number, OpenKey> = {
  0: { number: 1, letter: "d" }, // A minor
  1: { number: 8, letter: "d" }, // Bb minor
  2: { number: 3, letter: "d" }, // B minor
  3: { number: 10, letter: "d" }, // C minor
  4: { number: 5, letter: "d" }, // C# minor
  5: { number: 12, letter: "d" }, // D minor
  6: { number: 7, letter: "d" }, // Eb minor
  7: { number: 2, letter: "d" }, // E minor
  8: { number: 9, letter: "d" }, // F minor
  9: { number: 4, letter: "d" }, // F# minor
  10: { number: 11, letter: "d" }, // G minor
  11: { number: 6, letter: "d" }, // G# minor
  12: { number: 10, letter: "m" }, // A major
  13: { number: 5, letter: "m" }, // Bb major
  14: { number: 12, letter: "m" }, // B major
  15: { number: 7, letter: "m" }, // C major
  16: { number: 2, letter: "m" }, // Db major
  17: { number: 9, letter: "m" }, // D major
  18: { number: 4, letter: "m" }, // Eb major
  19: { number: 11, letter: "m" }, // E major
  20: { number: 6, letter: "m" }, // F major
  21: { number: 1, letter: "m" }, // F#/Gb major
  22: { number: 8, letter: "m" }, // G major
  23: { number: 3, letter: "m" }, // Ab major
};

/**
 * Convert a Traktor MUSICAL_KEY value (0-23) to Open Key notation.
 */
export function traktorKeyToOpenKey(value: number): OpenKey | undefined {
  return TRAKTOR_KEY_TO_OPEN_KEY[value];
}

type CollectionTrack = {
  title: string;
  artist: string;
  bpm: number | undefined;
  key: OpenKey | undefined;
};

/**
 * Parse an NML XML string and extract playlist information.
 */
export function parseNmlFile(xmlString: string): NmlPlaylist {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");

  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Invalid NML file: XML parsing failed");
  }

  // Build a map of file paths to track metadata from the COLLECTION
  const collectionMap = new Map<string, CollectionTrack>();
  const collectionEntries = doc.querySelectorAll("COLLECTION > ENTRY");

  for (const entry of collectionEntries) {
    const title = entry.getAttribute("TITLE") || "";
    const artist = entry.getAttribute("ARTIST") || "";

    // Extract BPM from TEMPO element
    const tempoEl = entry.querySelector("TEMPO");
    const bpmAttr = tempoEl?.getAttribute("BPM");
    const bpm = bpmAttr ? Math.round(parseFloat(bpmAttr)) : undefined;

    // Extract key from MUSICAL_KEY element
    const keyEl = entry.querySelector("MUSICAL_KEY");
    const keyValue = keyEl?.getAttribute("VALUE");
    const key =
      keyValue !== null && keyValue !== undefined
        ? traktorKeyToOpenKey(parseInt(keyValue, 10))
        : undefined;

    // Build the file path key from LOCATION
    const locationEl = entry.querySelector("LOCATION");
    if (locationEl) {
      const volume = locationEl.getAttribute("VOLUME") || "";
      const dir = locationEl.getAttribute("DIR") || "";
      const file = locationEl.getAttribute("FILE") || "";
      const fileKey = `${volume}${dir}${file}`;

      collectionMap.set(fileKey, { title, artist, bpm, key });
    }
  }

  // Find the playlist node and extract name
  const playlistNode = doc.querySelector('NODE[TYPE="PLAYLIST"]');
  const playlistName = playlistNode?.getAttribute("NAME") || "Imported Mix";

  // Get ordered track references from the playlist
  const playlistEntries = playlistNode?.querySelectorAll(
    "PLAYLIST > ENTRY > PRIMARYKEY",
  );
  const tracks: NmlTrack[] = [];

  if (playlistEntries) {
    for (const primaryKey of playlistEntries) {
      const key = primaryKey.getAttribute("KEY");
      if (key) {
        const trackData = collectionMap.get(key);
        if (trackData) {
          tracks.push({
            title: trackData.title,
            artist: trackData.artist,
            bpm: trackData.bpm,
            key: trackData.key,
          });
        }
      }
    }
  }

  return {
    name: playlistName,
    tracks,
  };
}
