import htmlEventAttributes from "@prettier/html-event-attributes";
import { Rule, type RuleDocumentation } from "html-validate";

export default class NoUseEventHandlerAttrRule extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"The use of event handler content attributes is discouraged. The mix of HTML and JavaScript often produces unmaintainable code, and the execution of event handler attributes may also be blocked by content security policies.",
			url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes#event_handler_attributes",
		};
	}

	public setup() {
		this.on("element:ready", ({ target }) => {
			for (const htmlEventAttr of htmlEventAttributes) {
				if (target.hasAttribute(htmlEventAttr)) {
					this.report({
						node: target,
						message: `The use of the ${htmlEventAttr} attribute is discouraged. Please use on <script> inside instead.`,
					});
				}
			}
		});
	}
}
