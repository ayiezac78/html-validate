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
		this.on("dom:ready", (event) => {
			const { document } = event;

			const figureElements = document.getElementsByTagName("figure");
			const divElements = document.getElementsByTagName("div");

			for (const figure of figureElements) {
				if (figure.tagName === "figure") {
					const hasImg = figure.querySelector("img");
					const hasFigcaption = figure.querySelector("figcaption");
					const hasCite = figure.querySelector("cite");

					// Check for missing img
					if (!hasImg) {
						this.report({
							node: figure,
							message: "The <img> element is required for <figure> elements.",
						});
					}

					// Check for cite instead of figcaption (more specific error)
					if (hasImg && hasCite && !hasFigcaption) {
						this.report({
							node: figure,
							message:
								"Use <figcaption> instead of <cite> for image captions within <figure> elements.",
						});
					}
					// Check for missing figcaption (generic error, only if cite check didn't trigger)
					else if (!hasFigcaption) {
						this.report({
							node: figure,
							message:
								"The <figcaption> element is required for <figure> elements.",
						});
					}
				}
			}

			for (const div of divElements) {
				if (div.tagName === "div") {
					const hasImg = div.querySelector("img");
					const hasCite = div.querySelector("cite");

					if (hasImg && hasCite) {
						this.report({
							node: div,
							message:
								"Consider using <figure> with <figcaption> instead of <div> with <img> and <cite> for better semantic HTML.",
						});
					}
				}
			}
		});
	}
}
