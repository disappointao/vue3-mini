# vue3-mini

vue3简易版

---

## Day 1 总结

- 初始化了 monorepo 项目结构，分为 reactivity（响应式系统）和 shared（工具函数）两个基础包。
- 配置了 pnpm 多包管理和 TypeScript 开发环境。
- 编写了基于 esbuild 的开发打包脚本（scripts/dev.js），支持各模块的本地开发和打包。

## Day 2 总结

- 实现了 `reactive` 方法，支持将对象转为响应式对象，内部通过 Proxy 和缓存机制防止重复代理。
- 实现了 `effect` 副作用收集的基础框架，能够在响应式数据变化时重新执行相关函数。
- 编写了响应式对象的代理 handler（`mutableHandlers`），并初步实现了依赖收集的入口（`track`）。
- 项目结构进一步完善，`reactivity` 包下新增了 `reactive.ts`、`effect.ts`、`baseHandlers.ts`、`reactiveEffect.ts` 等核心源码文件。

## Day 3 总结

- 实现了依赖收集的完整原理：完善了响应式系统中依赖的收集与管理机制。通过 `track` 和 `trackEffect`，确保每个响应式属性都能正确收集到依赖它的 effect，并通过 `_trackId` 机制防止重复收集。
- 实现依赖的自动清理：每次 effect 执行前后，自动清理无效或多余的依赖，避免内存泄漏和无效触发。通过 `preCleanEffect` 和 `postCleanEffect`，实现依赖的 diff 和精准移除。
- 完善了依赖触发机制：当响应式数据发生变化时，能够高效、准确地触发相关 effect 的重新执行，支持自定义 scheduler。
- 优化了 Proxy handler：在 `get` 时收集依赖，在 `set` 时对比新旧值并触发更新，保证响应式系统的高效和正确性。
- 代码结构优化：进一步拆分和优化了 `effect.ts`、`reactiveEffect.ts`、`baseHandlers.ts` 等核心文件，提升了可维护性和扩展性。
- 新增嵌套响应式支持：读取对象属性时自动递归转为响应式对象。
- effect 函数支持返回 runner，可手动触发和获取 effect 实例，支持 options 配置。
- 增加 effect 递归执行保护，防止死循环和重复触发。
- 新增 ref、toRef、toRefs、proxyRefs 等API，实现响应式基本数据的引用类型支持，便于处理基本类型和对象属性的响应式绑定。
