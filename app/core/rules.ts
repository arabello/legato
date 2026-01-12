import { match } from "ts-pattern";
import type { OpenKey } from "./openKey";

// Mixing rule type
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

export const allRules: HarmonicMixRule[] = [
  "maintain",
  "adjacent-number-uplift", // TODO: the two adjacents are mutually exclusive
  "adjacent-number-downlift", // TODO: the two adjacents are mutually exclusive
  "adjacent-letter-uplift", // TODO: the two adjacents are mutually exclusive
  "adjacent-letter-downlift", // TODO: the two adjacents are mutually exclusive
  "boost-one-semitone",
  "boost-two-semitone",
  "parallel-key-minor", // TODO: the two parallels are mutually exclusive
  "parallel-key-major", // TODO: the two parallels are mutually exclusive
];

// Function to apply a mixing rule to a root key
export function nextRootKey(
  rule: HarmonicMixRule,
): (rootKey: OpenKey) => OpenKey {
  return (rootKey: OpenKey) =>
    match(rule)
      .with("maintain", () => rootKey)
      .with("adjacent-number-uplift", () => ({
        ...rootKey,
        number: (rootKey.number % 12) + 1,
      }))
      .with("adjacent-number-downlift", () => ({
        ...rootKey,
        letter: rootKey.letter === "d" ? ("m" as const) : ("d" as const),
        number: rootKey.number,
      }))
      .with("adjacent-letter-uplift", () => ({
        ...rootKey,
        number: (rootKey.number % 12) + 1,
      }))
      .with("adjacent-letter-downlift", () => ({
        ...rootKey,
        number: (rootKey.number % 12) + 1,
      }))
      .with("boost-one-semitone", () => ({
        ...rootKey,
        number: (rootKey.number % 12) + 1,
      }))
      .with("boost-two-semitone", () => ({
        ...rootKey,
        number: (rootKey.number % 12) + 2,
      }))
      .with("parallel-key-minor", () => ({
        ...rootKey,
        letter: "m" as const,
        number: ((rootKey.number - 4 + 12) % 12) + 1,
      }))
      .with("parallel-key-major", () => ({
        ...rootKey,
        letter: "d" as const,
        number: ((rootKey.number + 3) % 12) + 1,
      }))
      .exhaustive();
}
