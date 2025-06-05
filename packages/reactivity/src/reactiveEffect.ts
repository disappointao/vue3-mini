// 依赖收集
import { activeEffect, trackEffect, triggerEffects } from "./effect";

// Map结构： {obj: {属性：Map:{effect, effect, effect}}}
const targetMap = new WeakMap();

export const createDep = (cleanup, key) => {
  const dep = new Map() as any; // 创建收集
  dep.cleanup = cleanup; // 清理
  dep.name = key; // 自定义的标识 表示这个映射表为哪个属性服务
  return dep;
};

// 收集依赖
export function track(target, key) {
  // activeEffect 属性存在时 说明这个key是在effect中被访问的
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key)));
    }
    trackEffect(activeEffect, dep);
  }
}

// 触发更新
export function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target);

  if (!depsMap) {
    return;
  }

  let dep = depsMap.get(key);
  if (dep) {
    triggerEffects(dep);
  }
}
