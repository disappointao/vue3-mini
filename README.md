# vue3-mini

本项目为 Vue3 响应式系统的简易实现，涵盖了核心的响应式对象、依赖收集、计算属性、侦听 API 及相关工具函数。

## 目录结构与功能模块

### 1. 响应式对象（reactive）

- **核心 API**：`reactive(target)`  
  将普通对象转为响应式对象，内部通过 `Proxy` 拦截 `get`/`set` 操作，实现依赖收集与变更通知。
- **实现要点**：
  - 只代理对象类型，非对象直接返回。
  - 利用 `WeakMap` 缓存已代理对象，防止重复代理。
  - 通过 `ReactiveFlags.IS_REACTIVE` 标记响应式对象。
  - 嵌套对象在访问时自动递归转为响应式。

### 2. 代理处理器（baseHandlers）

- **核心内容**：`mutableHandlers`
  - `get` 拦截：依赖收集，递归响应式，返回属性值。
  - `set` 拦截：对比新旧值，变更时触发依赖更新。
- **依赖收集与触发**：分别调用 `track` 和 `trigger`，实现属性级别的依赖追踪和变更响应。

### 3. 副作用与依赖收集（effect/reactiveEffect）

- **核心 API**：`effect(fn, options?)`
  - 注册副作用函数，自动追踪其依赖的响应式数据。
  - 支持自定义调度器（scheduler）、手动停止（stop）、runner 返回。
- **依赖收集机制**：
  - 通过全局 `activeEffect` 追踪当前激活的副作用。
  - `track`/`trigger` 维护依赖映射表（`targetMap`），实现属性到 effect 的映射。
  - 支持依赖的自动清理与 diff，防止内存泄漏和重复收集。
  - 递归执行保护，避免死循环。

### 4. ref 与引用工具（ref）

- **核心 API**：
  - `ref(value)`：为基本类型或对象创建响应式引用。
  - `toRef(object, key)`：将对象某个属性转为 ref。
  - `toRefs(object)`：将对象所有属性转为 ref。
  - `proxyRefs(objectWithRef)`：代理对象，自动解包/设置 ref。
- **实现要点**：
  - `RefImpl` 类封装响应式值，依赖收集与触发与 effect 机制兼容。
  - 支持响应式对象属性的引用绑定，便于解构和模板绑定。

### 5. 计算属性（computed）

- **核心 API**：`computed(getter | { get, set })`
  - 支持只读和可写计算属性。
  - 内部通过 `ReactiveEffect` 实现惰性求值和缓存，依赖变更时自动标记为脏并重新计算。
  - 依赖收集与 ref 机制兼容，可嵌套使用。
- **实现要点**：
  - `ComputeRefImpl` 类管理 getter、setter、依赖和脏值标记。
  - 依赖变更时通过 `triggerRefValue` 通知外部 effect。

### 6. 侦听 API（watch/watchEffect）

- **核心 API**：
  - `watch(source, callback, options)`：侦听响应式数据或 getter，数据变更时执行回调。
  - `watchEffect(effect, options)`：自动侦听 effect 内部依赖，依赖变更时重新执行。
- **特性支持**：
  - 深度侦听（deep）、立即执行（immediate）、清理回调（onCleanup）、手动停止（返回 unWatch）。
  - 支持侦听 ref、reactive、getter、函数等多种数据源。
- **实现要点**：
  - 通过 `ReactiveEffect` 追踪依赖，变更时自动调度回调。
  - `traverse` 实现深度依赖收集。
  - 回调参数支持新旧值、清理函数。

### 7. 常量与工具（constants/shared）

- **常量**：如 `ReactiveFlags`、`DirtyLevels`，用于标记响应式对象和脏值状态。
- **工具函数**：如 `isObject`、`isFunction`，辅助类型判断和通用逻辑。

## 设计亮点

- **模块化设计**：各功能点独立封装，便于理解和扩展。
- **依赖收集与清理**：支持精准依赖追踪和自动清理，防止内存泄漏。
- **API 兼容性**：与 Vue3 响应式 API 高度一致，便于学习和迁移。
- **类型支持**：TypeScript 编写，类型安全，便于二次开发。

---

如需进一步了解每个模块的实现细节，可直接查阅 `packages/reactivity/src/` 目录下的源码文件。