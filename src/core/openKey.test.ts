import { isOpenKey, openKeyFromString } from "./openKey";

describe("OpenKey Validation", () => {
  describe("isOpenKey", () => {
    it("should return true for valid OpenKey objects", () => {
      expect(isOpenKey({ number: 1, letter: "d" })).toBe(true);
      expect(isOpenKey({ number: 12, letter: "m" })).toBe(true);
      expect(isOpenKey({ number: 6, letter: "d" })).toBe(true);
    });

    it("should return false for invalid letter values", () => {
      expect(isOpenKey({ number: 1, letter: "a" })).toBe(false);
      expect(isOpenKey({ number: 1, letter: "D" })).toBe(false);
      expect(isOpenKey({ number: 1, letter: "M" })).toBe(false);
    });

    it("should return false for invalid number values", () => {
      expect(isOpenKey({ number: 0, letter: "d" })).toBe(false);
      expect(isOpenKey({ number: 13, letter: "d" })).toBe(false);
      expect(isOpenKey({ number: -1, letter: "d" })).toBe(false);
    });

    it("should return false for non-object inputs", () => {
      expect(isOpenKey(null)).toBe(false);
      expect(isOpenKey(undefined)).toBe(false);
      expect(isOpenKey("1d")).toBe(false);
      expect(isOpenKey(1)).toBe(false);
    });

    it("should return false for objects missing required properties", () => {
      expect(isOpenKey({ letter: "d" })).toBe(false);
      expect(isOpenKey({ number: 1 })).toBe(false);
      expect(isOpenKey({})).toBe(false);
    });
  });

  describe("openKeyFromString", () => {
    it("should parse valid OpenKey strings", () => {
      expect(openKeyFromString("1d")).toEqual({ number: 1, letter: "d" });
      expect(openKeyFromString("12m")).toEqual({ number: 12, letter: "m" });
      expect(openKeyFromString("6d")).toEqual({ number: 6, letter: "d" });
    });

    it("should return undefined for invalid string formats", () => {
      expect(openKeyFromString("")).toBeUndefined();
      expect(openKeyFromString("d")).toBeUndefined();
      expect(openKeyFromString("1")).toBeUndefined();
      expect(openKeyFromString("13d")).toBeUndefined();
      expect(openKeyFromString("1a")).toBeUndefined();
      expect(openKeyFromString("0d")).toBeUndefined();
      expect(openKeyFromString("d1")).toBeUndefined(); // Wrong order
    });

    it("should return undefined for non-string inputs", () => {
      expect(openKeyFromString(null as any)).toBeUndefined();
      expect(openKeyFromString(undefined as any)).toBeUndefined();
      expect(openKeyFromString(1 as any)).toBeUndefined();
      expect(openKeyFromString({} as any)).toBeUndefined();
    });
  });
});
