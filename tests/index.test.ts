import { describe, test, expect } from "bun:test";
import plugin from "../src/index";

describe("html-sentinel-shepherd plugin", () => {
  test("should export plugin object", () => {
    expect(plugin).toBeDefined();
    expect(typeof plugin).toBe("object");
  });

  test("should have name property", () => {
    expect(plugin.name).toBeDefined();
    expect(plugin.name).toBe("html-sentinel-shepherd");
  });

  test("should have rules property", () => {
    expect(plugin.rules).toBeDefined();
    expect(typeof plugin.rules).toBe("object");
  });

  test("should have configs property", () => {
    expect(plugin.configs).toBeDefined();
    expect(typeof plugin.configs).toBe("object");
  });

  describe("rules", () => {
    test("should export all expected rules", () => {
      const expectedRules = [
        "html-sentinel-shepherd/no-block-level-br",
        "html-sentinel-shepherd/no-use-event-handler-attr",
        "html-sentinel-shepherd/link-rel-canonical-require",
        "html-sentinel-shepherd/meta-description-require",
        "html-sentinel-shepherd/required-figcaption",
        "html-sentinel-shepherd/required-img-width-height-attr",
      ];

      for (const ruleName of expectedRules) {
        expect(plugin.rules[ruleName]).toBeDefined();
        expect(typeof plugin.rules[ruleName]).toBe("function");
      }
    });

    test("should have correct number of rules", () => {
      const ruleCount = Object.keys(plugin.rules).length;
      expect(ruleCount).toBe(6);
    });
  });

  describe("configs", () => {
    test("should export recommended config", () => {
      expect(plugin.configs.recommended).toBeDefined();
      expect(typeof plugin.configs.recommended).toBe("object");
    });

    test("recommended config should have rules", () => {
      expect(plugin.configs.recommended.rules).toBeDefined();
      expect(typeof plugin.configs.recommended.rules).toBe("object");
    });

    test("recommended config should include all rules as error", () => {
      const rules = plugin.configs.recommended.rules;
      const expectedRules = [
        "html-sentinel-shepherd/no-block-level-br",
        "html-sentinel-shepherd/no-use-event-handler-attr",
        "html-sentinel-shepherd/link-rel-canonical-require",
        "html-sentinel-shepherd/meta-description-require",
        "html-sentinel-shepherd/required-figcaption",
        "html-sentinel-shepherd/required-img-width-height-attr",
      ];

      for (const ruleName of expectedRules) {
        expect(rules[ruleName]).toBeDefined();
        expect(rules[ruleName]).toEqual(["error"]);
      }
    });
  });

  describe("rule instances", () => {
    test("each rule should have documentation method", () => {
      for (const [ruleName, RuleClass] of Object.entries(plugin.rules)) {
        const instance = new RuleClass();
        expect(instance.documentation).toBeDefined();
        expect(typeof instance.documentation).toBe("function");
        
        const doc = instance.documentation();
        expect(doc).toBeDefined();
        expect(doc.description).toBeDefined();
        expect(typeof doc.description).toBe("string");
        expect(doc.url).toBeDefined();
        expect(typeof doc.url).toBe("string");
      }
    });

    test("each rule should have setup method", () => {
      for (const [ruleName, RuleClass] of Object.entries(plugin.rules)) {
        const instance = new RuleClass();
        expect(instance.setup).toBeDefined();
        expect(typeof instance.setup).toBe("function");
      }
    });
  });
});