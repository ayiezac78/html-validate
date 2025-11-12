import { Rule, type RuleDocumentation } from "html-validate";

export default class MetaDescriptionRequire extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"<meta name='description'> with non-blank content must be present in <head> tag.",
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

			const metaDesc = head.querySelector('meta[name="description"]');

			if (!metaDesc) {
				this.report({
					node: head,
					message:
						"<meta name='description'> must be present inside <head> tag.",
				});
				return;
			}

			const content = metaDesc.getAttribute("content");

			if (
				!content ||
				content.value === null ||
				(content.value as string).trim() === ""
			) {
				this.report({
					node: metaDesc,
					message:
						"<meta name='description'> content attribute must not be empty.",
				});
			} else {
				const characterLength = (content.value as string).length;

				if (characterLength < 70 || characterLength > 160) {
					this.report({
						node: metaDesc,
						message:
							"<meta name='description'> content should be 70-160 characters long.",
					});
				}
			}
		});
	}
}
