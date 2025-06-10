export enum ReactiveFlags {
  IS_REACTIVE = "isReactive",
}

export enum DirtyLevels {
  Dirty = 4, // 脏值，以为取值要运行计算属性
  NoDirty = 0, // 不脏就用上一次的返回结果
}
