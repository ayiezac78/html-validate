import {
	type DOMReadyEvent,
	type HtmlElement,
	Rule,
	type RuleDocumentation,
} from "html-validate";

export default class NoBrBetweenElementsRule extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"The <br> element should only be used for line breaks within text content, not for spacing between HTML elements (use CSS margin/padding instead).",
			url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/br",
		};
	}

	public setup(): void {
		/* listen on dom ready event */
		this.on("dom:ready", (event: DOMReadyEvent) => {
			/* do something with the DOM tree */
			const { document } = event;
			const brElements = document.getElementsByTagName("br");

			/* report errors */
			for (const br of brElements) {
				const prev = this.getPrevMeaningful(br) as HtmlElement;
				const next = this.getNextMeaningful(br) as HtmlElement;

				const prevIsText =
					prev && prev.nodeType === 3 && prev.textContent.trim() !== "";
				const nextIsText =
					next && next.nodeType === 3 && next.textContent.trim() !== "";

				const prevIsBr =
					prev && prev.nodeType === 1 && prev.tagName.toLowerCase() === "br";
				const nextIsBr =
					next && next.nodeType === 1 && next.tagName.toLowerCase() === "br";

				const isAdjacentToText = prevIsText || nextIsText;
				const isStacked = prevIsBr || nextIsBr;

				if (isAdjacentToText && !isStacked) {
					continue;
				}

				this.report({
					node: br,
					message:
						"<br> must be used for line breaks within text content, not for vertical spacing. Avoid stacking <br> tags and using them between block elements.",
				});
			}
		});
	}

	private getPrevMeaningful(node: HtmlElement) {
		const parent = node.parent;

		if (parent === null) return null;

		const children = parent?.childNodes;
		let i = children.indexOf(node) - 1;

		while (i >= 0) {
			const n = children[i];
			if (n?.nodeType === 1) return n; // element
			if (n?.nodeType === 3 && n.textContent.trim() !== "") return n; // real text
			i--;
		}
		return null;
	}

	private getNextMeaningful(node: HtmlElement) {
		const parent = node.parent;

		if (parent === null) return null;

		const children = parent?.childNodes;
		let i = children.indexOf(node) + 1;

		while (i < children.length) {
			const n = children[i];
			if (n?.nodeType === 1) return n; // element
			if (n?.nodeType === 3 && n?.textContent.trim() !== "") return n; // real text
			i++;
		}
		return null;
	}
}
