import patchClass from "./modules/patchClass";
import patchStyle from "./modules/patchStyle";
import patchEvent from "./modules/patchEvent";
import patchAttr from "./modules/patchAttr";

// 主要对节点元素的增删改查 class style event
// diff
export default function patchProp(el, key, preValue, nextValue) {
  if (key === "class") {
    return patchClass(el, nextValue);
  } else if (key === "style") {
    return patchStyle(el, preValue, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    // 事件 都是 on开头
    return patchEvent(el, key, nextValue);
  } else {
    // 普通属性
    return patchAttr(el, key, nextValue);
  }
}
