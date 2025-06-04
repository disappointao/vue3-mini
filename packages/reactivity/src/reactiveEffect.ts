// 依赖收集
import { activeEffect } from "./effect";

export function track(target, key) {
  // activeEffect 属性存在时 说明这个key是在effect中被访问的
  if (activeEffect) {
    // TODO
    console.log(key, activeEffect);
  }
}
