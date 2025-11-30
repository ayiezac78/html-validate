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
			const head = document.getElementsByTagName("head");

			if (!head || head.length === 0) {
				return;
			}

			for (const headElement of head) {
				const links = headElement.getElementsByTagName("link");
				const canonicalLinks: typeof links = [];

				for (const link of links) {
					const rel = link.getAttributeValue("rel");
					if (rel && rel.toLowerCase() === "canonical") {
						canonicalLinks.push(link);
					}
				}

				// Check if no canonical link exists
				if (canonicalLinks.length === 0) {
					this.report({
						node: headElement,
						message: "<link rel='canonical'> must be present inside <head>.",
					});
				}

				// Check for duplicate canonical links
				if (canonicalLinks.length > 1) {
					const firstLink = canonicalLinks[0] as (typeof links)[0];
					this.report({
						node: firstLink,
						message:
							"Multiple canonical <link> tags found; only one is allowed.",
					});
				}

				for (const canonical of canonicalLinks) {
					const href = canonical.getAttributeValue("href");

					if (
						!href ||
						href === null ||
						(typeof href === "string" && href.trim() === "")
					) {
						this.report({
							node: canonical,
							message:
								"<link rel='canonical'> must have a non-empty href attribute.",
						});

						continue;
					}

					const hasSSI = /<!--#\s*include\s+virtual=/.test(href);

					if (hasSSI) {
						continue;
					}

					try {
						// Check if it's a valid absolute URL
						new URL(href);
					} catch (_e) {
						this.report({
							node: canonical,
							message: `<link rel='canonical'> has an invalid URL: "${href}".`,
						});
					}
				}
			}
		});
	}
}
