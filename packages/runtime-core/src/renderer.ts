import { ShapeFlags } from "@vue/shared";

export function createRenderer(renderOptions) {
  // core 中不关心如何渲染
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp,
  } = renderOptions;

  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      // todo: children[i] 可能是纯文本
      patch(null, children[i], container);
    }
  };

  const mountElement = (vnode, container) => {
    const { type, children, props, shapeFlag } = vnode;

    let el = hostCreateElement(type);
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // shapeFlag设置的时候是一个与操作 1 | 8  9
    // 或操作 9 & 8 > 0 说明儿子是文本元素
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }
    hostInsert(el, container);
  };

  // 渲染走这里，更新走这里
  const patch = (n1, n2, container) => {
    // 两次渲染相同直接跳过
    if (n1 === n2) return;
    if (n1 === null) {
      mountElement(n2, container);
    }
  };

  // 多次调用render 会进行虚拟节点的比较， 再进行更新
  const render = (vnode, container) => {
    // 将虚拟节点变成真实接地那进行渲染
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  };
  return {
    render,
  };
}
