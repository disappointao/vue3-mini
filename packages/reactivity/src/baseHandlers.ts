import { track, trigger } from "./reactiveEffect";

export enum ReactiveFlags {
  IS_REACTIVE = "isReactive",
}
export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // 依赖收集
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  // 取值的时候 和effect映射起来
  set(target, key, value, receiver) {
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      // 触发更新
      trigger(target, key, value, oldValue);
    }
    return result;
  },
};
