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
			if (target.tagName === "figure" && !target.querySelector("figcaption")) {
				this.report({
					node: target,
					message:
						"The <figcaption> element is required for <figure> elements.",
				});
			}

			if (target.tagName === "figure" && !target.querySelector("img")) {
				this.report({
					node: target,
					message: "The <img> element is required for <figure> elements.",
				});
			}
		});
	}
}