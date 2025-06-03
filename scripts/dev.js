// 该文件用于打包packages下的模块
// node dev.js 打包模块的名字 -f 打包的格式

import minimist from "minimist";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import esbuild from "esbuild";

// node中获取命令中的参数
const args = minimist(process.argv.slice(2));

// esm 使用 commonjs 变量
const __filename = fileURLToPath(import.meta.url); // 获取文件的绝对路径 file: -> /usr
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const target = args._[0] || "reactivity"; // 打包模块
const format = args.f || "iife"; // 打包后的模块化规范

// 入口文件解析
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);
const pkg = require(`../packages/${target}/package.json`);

esbuild
  .context({
    entryPoints: [entry],
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
    bundle: true, // 依赖的模块会打包到一起
    platform: "browser", // 打包后浏览器可以使用
    sourcemap: true,
    format, // cjs esm iife (iife需要定义名字)
    globalName: pkg.buildOptions?.name,
  })
  .then((ctx) => {
    console.log("start dev: 开始打包");

    return ctx.watch(); // 监控入口文件 持续进行打包
  });
