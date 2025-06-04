import { isObject } from "@vue/shared";
import { ReactiveFlags, mutableHandlers } from "./baseHandlers";

// 缓存代理过的对象
const reactiveMap = new WeakMap();

function createReactiveObject(target) {
  if (!isObject(target)) {
    return;
  }
  // 防止重复代理proxy对象
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }
  const existProxy = reactiveMap.get(target);
  if (existProxy) {
    return existProxy;
  }
  let proxy = new Proxy(target, mutableHandlers);
  // 缓存
  reactiveMap.set(target, proxy);
  return proxy;
}

export function reactive(target) {
  return createReactiveObject(target);
}
