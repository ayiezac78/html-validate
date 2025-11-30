import { HtmlValidate } from "html-validate";
import plugin from "../src/index";

export function createValidator(rules: Record<string, unknown>) {
  const htmlvalidate = new HtmlValidate({
    plugins: [plugin],
    rules,
  });
  return htmlvalidate;
}

export async function validateHtml(html: string, rules: Record<string, unknown>) {
  const validator = createValidator(rules);
  return validator.validateString(html);
}

export function expectError(report: any, message: string | RegExp) {
  expect(report.valid).toBe(false);
  expect(report.errorCount).toBeGreaterThan(0);
  
  const hasMatchingError = report.results[0]?.messages.some((msg: any) => {
    if (typeof message === 'string') {
      return msg.message.includes(message);
    }
    return message.test(msg.message);
  });
  
  expect(hasMatchingError).toBe(true);
}

export function expectValid(report: any) {
  expect(report.valid).toBe(true);
  expect(report.errorCount).toBe(0);
}