import LinkRelCanonicalRequire from "./link-rel-canonical-require";
import MetaDescriptionRequire from "./meta-description-require";
import NoBrBetweenElementsRule from "./no-block-level-br";
import NoUseEventHandlerAttrRule from "./no-use-event-handler-attr";
import RequiredFigcaptionRule from "./required-figcaption";
import RequiredWidthHeightRule from "./required-img-width-height-attr";

const rules = {
	"html-sentinel-shepherd/no-block-level-br": NoBrBetweenElementsRule,
	"html-sentinel-shepherd/no-use-event-handler-attr": NoUseEventHandlerAttrRule,
	"html-sentinel-shepherd/link-rel-canonical-require": LinkRelCanonicalRequire,
	"html-sentinel-shepherd/meta-description-require": MetaDescriptionRequire,
	"html-sentinel-shepherd/required-figcaption": RequiredFigcaptionRule,
	"html-sentinel-shepherd/required-img-width-height-attr":
		RequiredWidthHeightRule,
};

export default rules;
