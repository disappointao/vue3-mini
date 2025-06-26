import { isString, ShapeFlags } from "@vue/shared";

export function isVnode(node) {
  return node?.__v_isVNode;
}

export function isSameVnode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}

export function createVnode(type, props, children?) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    key: props?.key, // diff算法后面需要key
    el: null, // 虚拟节点需要对应的真实节点
    shapeFlag,
  };
  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
    } else {
      children = String(children);

      vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
    }
  }
  return vnode;
}
