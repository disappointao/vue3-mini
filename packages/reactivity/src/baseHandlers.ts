import { track } from "./reactiveEffect";

export enum ReactiveFlags {
  IS_REACTIVE = "isReactive",
}
export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, recevier) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // 依赖收集
    track(target, key);
    return Reflect.get(target, key, recevier);
  },
  // 取值的时候 和effect映射起来
  set(target, key, value, recevier) {
    return Reflect.set(target, key, value, recevier);
  },
};
