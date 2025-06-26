import { ShapeFlags } from "@vue/shared";
import { isSameVnode } from "./createVnode";
import { getSequence } from "./seq";

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

  const mountElement = (vnode, container, anchor) => {
    const { type, children, props, shapeFlag } = vnode;

    // 第一次渲染的时候要让虚拟节点和真实dom创建关联 vnode.el = 真实dom
    // 第二次渲染新的vnode, 可以和上一次的vnode做对比, 之后更新对应的el元素，可以后续再复用这个dom元素
    let el = (vnode.el = hostCreateElement(type));
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
    hostInsert(el, container, anchor);
  };

  const patchProps = (oldProps, newProps, el) => {
    // 新的要全部生效
    for (let key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key]);
    }

    for (let key in oldProps) {
      // 以前多的没有了要删除
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };

  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      unmount(child);
    }
  };

  // vue3 中diff分为两种 全量diff(递归diff) 快速diff(靶向更新 -> 基于模板编译)
  const patchKeyedChildren = (c1, c2, el) => {
    // 比较两个儿子的差异更新el
    // 1. 减少对比范围，先从头开始比，再从尾部开始比较， 确定不一样的范围
    // 2. 从头比对，再从尾部比对，如果有多余的或者新增的直接操作即可

    // [a,b,c]
    // [a,b,d,e]
    let i = 0; // 开始比对的索引
    let e1 = c1.length - 1; // 第一个数组的尾部索引
    let e2 = c2.length - 1; // 第二个数组的尾部索引

    while (i <= e1 && i <= e2) {
      // 有任何一方循环结束了 就要终止比较
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el); // 更新当前节点的属性和儿子（递归比较子节点）
      } else {
        break;
      }
      i++;
    }
    // 到c的位置终止了
    // 到d的位置终止了
    // c
    // d e
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el); // 更新当前节点的属性和儿子（递归比较子节点）
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // [a,b] [a,b,c] | [a,b] [c,a,b]
    // 处理增加和删除的特殊情况 [a,b,c] [a,b] | [c,a,b] [a,b ]
    // a b
    // a b c ->  i=2 , e1 =1, e2 = 2 i> e1 && i <= e2 新多老少

    // a b
    // c a b -> i = 0 , e1 = -1 e2 = 0 i > e1 && i <= e2 新多老少

    if (i > e1) {
      // 新的多
      if (i <= e2) {
        // 有插入的部分 insert
        let nextPos = e2 + 1; // 看一下当前下一个元素是否存在
        let anchor = c2[nextPos]?.el;
        while (i <= e2) {
          patch(null, c2[i], el, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // a,b,c
      // a,b i = 2 e1 = 2 e2 = 1 i  > e2 i <= e1
      // c,a,b
      // a,b i = 0 e1 = 1 e2 = -1 i > e2 i <= e1
      if (i <= e1) {
        while (i <= e1) {
          unmount(c1[i]);
          i++;
        }
      }
    } else {
      // a b  c d e   f g
      // a b  e c d h f g
      // i = 2  e1 =4  e2 = 5
      // 以上确认不变化的节点，并且对插入和移除做了处理
      // 后面就是特殊的对比方式
      let s1 = i;
      let s2 = i;

      const keyToNewIndexMap = new Map(); // 做一个映射表用于快速查找，看老的是否在新的里面。 没有就删除，有就更新
      let toBePatched = e2 - s2 + 1; // 要倒序插入的个数

      // 找出新的数据在老数据中索引位置的一个映射(+1) 0 代表是一个新增要创建的节点
      const newIndexToOldMapIndex = new Array(toBePatched).fill(0); //e c d h  [0, 0, 0, 0] -> [5 , 3 , 4, 0]

      // [4, 2, 3, 0] -> [1, 2] 根据最长递增子序列求出对应的 索引结果

      for (let i = s2; i <= e2; i++) {
        const vnode = c2[i];
        keyToNewIndexMap.set(vnode.key, i);
      }
      for (let i = s1; i <= e1; i++) {
        const vnode = c1[i];
        const newIndex = keyToNewIndexMap.get(vnode.key); // 通过可以找对应的索引
        if (newIndex === undefined) {
          // 如果新的里面找不到，就要删除对应旧的
          unmount(c1[i]);
        } else {
          // i 可能是0的情况 为了保证0 是没有对比过的元素， 直接 i + 1
          newIndexToOldMapIndex[newIndex - s2] = i + 1; // [0, 0, 0, 0] -> [5, 3, 4, 0]
          // 比较前后节点的差异，更新属性和儿子
          patch(vnode, c2[newIndex], el);
        }
      }
      // 调整顺序
      // 按照新的队列，倒序插入 insertBefore 通过参照物往前面插入

      // 插入的过程中，可能新的元素多，需要创建
      // 从索引位置倒序插入

      let increasingSeq = getSequence(newIndexToOldMapIndex);
      let j = increasingSeq.length - 1; //索引

      for (let i = toBePatched - 1; i >= 0; i--) {
        let newIndex = s2 + i; // 需调整元素的最后一个元素对应的索引，找他的下一个元素作为参照物
        let anchor = c2[newIndex + 1]?.el;
        let vnode = c2[newIndex];
        if (!vnode.el) {
          // 新列表中新增的元素
          patch(null, vnode, el, anchor); // 创建 插入
        } else {
          if (i === increasingSeq[j]) {
            j--; // diff算法优化
          } else {
            hostInsert(vnode.el, el, anchor); // 倒序插入
          }
        }
      }
    }
  };

  const patchChildren = (n1, n2, el) => {
    // text array null
    // 子元素比较情况
    // 新儿子 旧儿子 操作方式
    // 文本 数组 删除老儿子，设置文本内容
    // 文本 文本 更新文本
    // 文本 空 更新文本
    // 数组 数组 diff 算法
    // 数组 文本 清空文本，进行挂载
    // 数组 空  进行挂载
    // 空 数组 删除所有儿子
    // 空 文本 清空文本
    // 空 空 无需处理
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    // 1. 新的是文本，老的是数组移除老的
    // 2. 新的是文本，老的也是文本，内容不相同替换
    // 3. 老的是数组，新的是数组， 全量diff
    // 4. 老的是数组，新的不是数组，移除老的子节点
    // 5. 老的是文本，新的是空
    // 6. 老的是文本，新的是数组
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新文本 旧数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 全量diff 算法 两个数组的比对
          patchKeyedChildren(c1, c2, el);
        } else {
          unmountChildren(c1);
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, "");
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
      }
    }
  };

  const patchElement = (n1, n2, container) => {
    // 1. 比较元素的差异，肯定需要服用dom元素
    // 2. 比较属性和元素的子节点
    let el = (n2.el = n1.el); // 对dom元素的复用

    let oldProps = n1.props || {};
    let newProps = n2.props || {};

    // hostPatchProp 只针对某一个属性来处理 class style event attr
    patchProps(oldProps, newProps, el);
    patchChildren(n1, n2, el);
  };

  const processElement = (n1, n2, container, anchor) => {
    if (n1 === null) {
      mountElement(n2, container, anchor);
    } else {
      // 两个有差异
      patchElement(n1, n2, container);
    }
  };

  // 渲染走这里，更新走这里
  const patch = (n1, n2, container, anchor = null) => {
    // 两次渲染相同直接跳过
    if (n1 === n2) return;

    // 直接移除老的dom元素， 初始化新的dom元素
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1);
      n1 = null; // 就会执行后续n2的初始化
    }

    processElement(n1, n2, container, anchor); //  对元素处理
  };

  const unmount = (vnode) => hostRemove(vnode.el);

  // 多次调用render 会进行虚拟节点的比较， 再进行更新
  const render = (vnode, container) => {
    if (vnode === null) {
      // 移除当前容器中的元素
      if (container._vnode) {
        unmount(container._vnode);
      }
    }

    // 将虚拟节点变成真实接地那进行渲染
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  };
  return {
    render,
  };
}
