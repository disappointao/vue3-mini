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
