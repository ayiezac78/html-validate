import { describe, test, expect } from "bun:test";
import configs from "../src/configs";

describe("configs", () => {
  test("should export configs object", () => {
    expect(configs).toBeDefined();
    expect(typeof configs).toBe("object");
  });

  describe("recommended config", () => {
    test("should have recommended configuration", () => {
      expect(configs.recommended).toBeDefined();
    });

    test("should have rules property", () => {
      expect(configs.recommended.rules).toBeDefined();
      expect(typeof configs.recommended.rules).toBe("object");
    });

    test("should configure all rules as error", () => {
      const rules = configs.recommended.rules;
      const ruleNames = Object.keys(rules);
      
      expect(ruleNames.length).toBe(6);
      
      for (const ruleName of ruleNames) {
        expect(rules[ruleName]).toEqual(["error"]);
      }
    });

    test("should include no-block-level-br rule", () => {
      expect(
        configs.recommended.rules["html-sentinel-shepherd/no-block-level-br"]
      ).toEqual(["error"]);
    });

    test("should include no-use-event-handler-attr rule", () => {
      expect(
        configs.recommended.rules["html-sentinel-shepherd/no-use-event-handler-attr"]
      ).toEqual(["error"]);
    });

    test("should include link-rel-canonical-require rule", () => {
      expect(
        configs.recommended.rules["html-sentinel-shepherd/link-rel-canonical-require"]
      ).toEqual(["error"]);
    });

    test("should include meta-description-require rule", () => {
      expect(
        configs.recommended.rules["html-sentinel-shepherd/meta-description-require"]
      ).toEqual(["error"]);
    });

    test("should include required-figcaption rule", () => {
      expect(
        configs.recommended.rules["html-sentinel-shepherd/required-figcaption"]
      ).toEqual(["error"]);
    });

    test("should include required-img-width-height-attr rule", () => {
      expect(
        configs.recommended.rules["html-sentinel-shepherd/required-img-width-height-attr"]
      ).toEqual(["error"]);
    });
  });

  test("should have consistent rule naming", () => {
    const rules = configs.recommended.rules;
    const ruleNames = Object.keys(rules);
    
    for (const ruleName of ruleNames) {
      expect(ruleName).toMatch(/^html-sentinel-shepherd\//);
    }
  });
});