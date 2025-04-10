import { OpenKey } from "./openKey";

// Mixing rule type
export type HarmonicMixRule =
  | "maintain"
  | "adjacent-uplift"
  | "adjacent-downlift"
  | "boost-one-semitone"
  | "boost-two-semitone"
  | "parallel-key-minor"
  | "parallel-key-major";

// Function to apply a mixing rule to a root key
export function nextRootKey(
  rule: HarmonicMixRule,
): (rootKey: OpenKey) => OpenKey {
  return (rootKey: OpenKey) => {
    switch (rule) {
      case "maintain":
        return { ...rootKey };

      case "adjacent-uplift":
        return {
          ...rootKey,
          number: (rootKey.number % 12) + 1,
        };

      case "adjacent-downlift":
        return {
          letter: rootKey.letter === "d" ? "m" : "d",
          number: rootKey.number,
        };

      case "boost-one-semitone":
        return {
          ...rootKey,
          number: ((rootKey.number + 6) % 12) + 1,
        };

      case "boost-two-semitone":
        return {
          ...rootKey,
          number: ((rootKey.number + 1) % 12) + 1,
        };

      case "parallel-key-minor":
        return {
          letter: "m",
          number: ((rootKey.number - 4 + 12) % 12) + 1,
        };

      case "parallel-key-major":
        return {
          letter: "d",
          number: ((rootKey.number + 3) % 12) + 1,
        };
    }
  };
}
