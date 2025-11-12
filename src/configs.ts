import type { ConfigData } from "html-validate";

const configs: Record<string, ConfigData> = {
	recommended: {
		rules: {
			"html-sentinel-shepherd/no-block-level-br": ["error"],
			"html-sentinel-shepherd/no-use-event-handler-attr": ["error"],
			"html-sentinel-shepherd/link-rel-canonical-require": ["error"],
			"html-sentinel-shepherd/meta-description-require": ["error"],
			"html-sentinel-shepherd/required-figcaption": ["error"],
			"html-sentinel-shepherd/required-img-width-height-attr": ["error"],
		},
	},
};

export default configs;
