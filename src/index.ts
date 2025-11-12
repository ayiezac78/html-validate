import { compatibilityCheck, type Plugin } from "html-validate";
import { name, peerDependencies } from "../package.json";
import configs from "./configs";
import rules from "./rules";

const range = peerDependencies["html-validate"];
compatibilityCheck(name, range);

const plugin: Plugin = {
	name,
	rules,
	configs,
};

export default plugin;
