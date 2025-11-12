import { definePlugin } from "html-validate";
import LinkRelCanonicalRequire from "./rules/link-rel-canonical-require";
import MetaDescriptionRequire from "./rules/meta-description-require";
import NoBrBetweenElementsRule from "./rules/no-block-level-br";
import NoUseEventHandlerAttrRule from "./rules/no-use-event-handler-attr";
import RequiredFigcaptionRule from "./rules/required-figcaption";
import RequiredWidthHeightRule from "./rules/required-img-width-height-attr";

export default definePlugin({
	name: "html-sentinel-shepherd",
	rules: {
		"html-sentinel-shepherd/no-block-level-br": NoBrBetweenElementsRule,
		"html-sentinel-shepherd/no-use-event-handler-attr":
			NoUseEventHandlerAttrRule,
		"html-sentinel-shepherd/link-rel-canonical-require":
			LinkRelCanonicalRequire,
		"html-sentinel-shepherd/meta-description-require": MetaDescriptionRequire,
		"html-sentinel-shepherd/required-figcaption": RequiredFigcaptionRule,
		"html-sentinel-shepherd/required-img-width-height-attr":
			RequiredWidthHeightRule,
	},
	configs: {
		recommended: {
			rules: {
				"html-sentinel-shepherd/no-block-level-br": "error",
				"html-sentinel-shepherd/no-use-event-handler-attr": "error",
				"html-sentinel-shepherd/link-rel-canonical-require": "error",
				"html-sentinel-shepherd/meta-description-require": "error",
				"html-sentinel-shepherd/required-figcaption": "error",
				"html-sentinel-shepherd/required-img-width-height-attr": "error",
			},
		},
	},
});
