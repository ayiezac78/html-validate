import { Rule, type RuleDocumentation } from "html-validate";

export default class LinkRelCanonicalRequire extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"<link rel='canonical'> with non-blank href must be present in <head> tag.",
			url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel#canonical",
		};
	}

	public setup() {
		this.on("dom:ready", (event) => {
			const { document } = event;
			const head = document.querySelector("head");

			if (!head) {
				return;
			}

			const canonicalLink = head.querySelector('link[rel="canonical"]');

			if (!canonicalLink) {
				this.report({
					node: head,
					message: "<link rel='canonical'> must be present inside <head>.",
				});
				return;
			}

			const href = canonicalLink.getAttribute("href");

			if (
				!href ||
				href.value === null ||
				(href.value as string).trim() === ""
			) {
				this.report({
					node: canonicalLink,
					message:
						"<link rel='canonical'> must have a non-empty href attribute.",
				});
			}
		});
	}
}
