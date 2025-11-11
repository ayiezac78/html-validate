import {definePlugin} from "html-validate";
import NoBrBetweenElementsRule from "./rules/no-block-level-br";
import NoUseEventHandlerAttrRule from "./rules/no-use-event-handler-attr";

export default definePlugin({
  name: "html-sentinel",
  rules:{
    "html-sentinel/no-block-level-br": NoBrBetweenElementsRule,
    "html-sentinel/no-use-event-handler-attr": NoUseEventHandlerAttrRule,
  },
  configs:{
    recommended: {
      rules:{
        "html-sentinel/no-block-level-br": "error",
        "html-sentinel/no-use-event-handler-attr": "error",
      }
    }
  }
})