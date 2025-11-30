import { Rule, type RuleDocumentation } from "html-validate";

export default class RequiredWidthHeightRule extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"An <img> element must have both 'width' and 'height' attributes.",
			url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img",
		};
	}

	public setup() {
		this.on("element:ready", ({ target }) => {
			const width = target.getAttribute("width");
			const height = target.getAttribute("height");

			const hasValidWidth =
				width && typeof width.value === "string" && width.value.trim() !== "";
			const hasValidHeight =
				height &&
				typeof height.value === "string" &&
				height.value.trim() !== "";

			const srcValue = target.getAttributeValue("src");

			const hasModernImageFmt = /\.(webp|avif)(\?.*)?$/i.test(
				srcValue as string,
			);

			switch (true) {
				case !hasValidWidth && !hasValidHeight:
					this.report({
						node: target,
						message:
							"<img> element must have both 'width' and 'height' attributes.",
					});
					break;
				case !width:
					this.report({
						node: target,
						message: "<img> element is missing the 'width' attribute.",
					});
					break;
				case !height:
					this.report({
						node: target,
						message: "<img> element is missing the 'height' attribute.",
					});
					break;
				case !hasModernImageFmt:
					this.report({
						node: target,
						message:
							"Use modern image formats like WebP or AVIF instead of PNG/JPG/JPEG for better performance.",
					});
					break;
				default:
					break;
			}
		});
	}
}
