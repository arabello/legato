import { formatOpenKey, openKeyFromString } from "./openKey";
import {
  getHarmonicRule,
  harmonicRuleDefinitions,
  type HarmonicRule,
  type HarmonicMood,
  type HarmonicRuleDefinition,
  type HarmonicRuleType,
} from "./transitions";

export {
  getHarmonicRule,
  type HarmonicRule as HarmonicMixRule,
  type HarmonicMood,
  type HarmonicRuleDefinition,
  type HarmonicRuleType,
} from "./transitions";

export type HarmonicSuggestion = Omit<HarmonicRuleDefinition, "transform">;

export function getHarmonicSuggestions(
  keyString: string,
): HarmonicSuggestion[] {
  const root = openKeyFromString(keyString);
  if (!root) {
    return [];
  }

  return harmonicRuleDefinitions.map(({ transform, ...metadata }) => metadata);
}

export function projectHarmonicSuggestion(
  keyString: string,
  ruleId: HarmonicRule,
) {
  const root = openKeyFromString(keyString);
  if (!root) {
    return null;
  }

  const rule = getHarmonicRule(ruleId);
  if (!rule) {
    return null;
  }

  const projected = rule.transform(root);
  return formatOpenKey(projected);
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

  return harmonicRuleDefinitions.find((rule) => {
    const projected = rule.transform(from);
    return projected.number === to.number && projected.letter === to.letter;
  });
}
