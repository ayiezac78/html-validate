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

			const metaDesc = head?.querySelectorAll('meta[name="description"]');

			if (!metaDesc || metaDesc.length === 0) {
				this.report({
					node: head,
					message:
						"<meta name='description'> must be present inside <head> tag.",
				});
				return;
			}

			for (const meta of metaDesc) {
				const content = meta.getAttribute("content");

				if (
					!content ||
					content.value === null ||
					(typeof content.value === "string" && content.value.trim() === "")
				) {
					this.report({
						node: meta,
						message:
							"<meta name='description'> content attribute must not be empty.",
					});
				} else {
					const characterLength = (content.value as string).length;

					if (characterLength < 70 || characterLength > 160) {
						this.report({
							node: meta,
							message:
								"<meta name='description'> content should be 70-160 characters long.",
						});
					}
				}
			}

			// Check for duplicate meta desc tags
			if (metaDesc.length > 1) {
				const meta = metaDesc[0] as (typeof metaDesc)[0];
				this.report({
					node: meta,
					message:
						"Multiple <meta name='description'> tags found; only one is allowed.",
				});
			}
		});
	}
}
