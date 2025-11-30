import { Rule, type RuleDocumentation } from "html-validate";

export default class RequiredFigcaptionRule extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"The <figcaption> element is required for <figure> elements.",
			url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figcaption",
		};
	}

	public setup() {
		this.on("element:ready", ({ target }) => {
			if (target.tagName === "figure") {
				const hasImg = target.querySelector("img");
				const hasFigcaption = target.querySelector("figcaption");
				const hasCite = target.querySelector("cite");

				// Check for missing img
				if (!hasImg) {
					this.report({
						node: target,
						message: "The <img> element is required for <figure> elements.",
					});
				}

				// Check for cite instead of figcaption (more specific error)
				if (hasImg && hasCite && !hasFigcaption) {
					this.report({
						node: target,
						message:
							"Use <figcaption> instead of <cite> for image captions within <figure> elements.",
					});
				}
				// Check for missing figcaption (generic error, only if cite check didn't trigger)
				else if (!hasFigcaption) {
					this.report({
						node: target,
						message:
							"The <figcaption> element is required for <figure> elements.",
					});
				}
			}

			if (target.tagName === "div") {
				const hasImg = target.querySelector("img");
				const hasCite = target.querySelector("cite");

				if (hasImg && hasCite) {
					this.report({
						node: target,
						message:
							"Consider using <figure> with <figcaption> instead of <div> with <img> and <cite> for better semantic HTML.",
					});
				}
			}
		});
	}
}
