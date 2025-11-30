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
		this.on("dom:ready", (event) => {
			const { document } = event;

			const imgEl = document.getElementsByTagName("img");

			for (const img of imgEl) {
				const width = img.getAttribute("width");
				const height = img.getAttribute("height");

				const hasValidWidth =
					width && typeof width.value === "string" && width.value.trim() !== "";
				const hasValidHeight =
					height &&
					typeof height.value === "string" &&
					height.value.trim() !== "";

				const srcValue = img.getAttributeValue("src");
				const hasModernImageFmt =
					typeof srcValue === "string" &&
					/\.(webp|avif)(\?.*)?$/i.test(srcValue);
				switch (true) {
					case !hasValidWidth && !hasValidHeight:
						this.report({
							node: img,
							message:
								"<img> element must have both 'width' and 'height' attributes.",
						});
						break;
					case !width:
						this.report({
							node: img,
							message: "<img> element is missing the 'width' attribute.",
						});
						break;
					case !height:
						this.report({
							node: img,
							message: "<img> element is missing the 'height' attribute.",
						});
						break;
					case !hasModernImageFmt:
						this.report({
							node: img,
							message:
								"Use modern image formats like WebP or AVIF instead of PNG/JPG/JPEG for better performance.",
						});
						break;
					default:
						break;
				}
			}
		});
	}
}
