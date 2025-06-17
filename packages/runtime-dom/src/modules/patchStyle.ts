export default function patchStyle(el, preValue, nextValue) {
  let style = el.style;
  for (let key in nextValue) {
    style[key] = nextValue[key]; // 新样式要全部生效
  }

  if (preValue) {
    for (let key in preValue) {
      // 看以前的属性，现在有没有，如果没有则删除
      if (nextValue[key] === null) {
        style[key] = null;
      }
    }
  }
}
