// h 函数 可以传1，2，3，或多个对象
// 1.两个参数的时候 第二个参数可能是属性，或者虚拟节点 (__v_isVNode判断)
// 2.第二个参数就是一个数组 -> 儿子
// 3.其它情况就是属性
// 4.直接传递非对象，文本
// 5.不能出现撒个参数的时候，第二个参数不是属性
// 6.如果超过三个参数的，后面都是儿子

import { isObject } from "@vue/shared";
import { createVnode } from "./createVnode";

export function h(type, propsOrChildren, children?) {
  let l = arguments.length;
  if (l === 2) {
    // h(h1, 虚拟节点|属性)
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      // 虚拟节点
      if (isVnode(propsOrChildren)) {
        //  h('div', h('a'))
        return createVnode(type, null, [propsOrChildren]);
      }
      // 属性
      return createVnode(type, propsOrChildren);
    }
    // 儿子是数组 | 文本
    return createVnode(type, null, propsOrChildren);
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2);
    }
    if (l === 3 && isVnode(children)) {
      children = [children];
    }
    //  ==3 | ==1
    return createVnode(type, propsOrChildren, children);
  }
}

function isVnode(node) {
  return node?.__v_isVNode;
}
