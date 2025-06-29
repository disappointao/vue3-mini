import { reactive } from "@vue/reactivity";
import { hasOwn, isFunction } from "@vue/shared";

export function createComponentInstance(vnode) {
  const instance = {
    data: null, // 状态
    vnode, // 组件的虚拟节点
    subTree: null, // 子树
    isMounted: false, // 是否挂载完成
    update: null, // 组件的更新函数
    attrs: {},
    props: {},
    propsOptions: vnode.type.props, // 用户申明的组件属性
    component: null,
    proxy: null, // 代理 props attrs data 让用户更方便的使用
  };
  return instance;
}

// 初始化属性
const initProps = (instance, rawProps) => {
  const props = {};
  const attrs = {};
  const propsOptions = instance.propsOptions; // 用户组件中定义的
  if (rawProps) {
    for (let key in rawProps) {
      const value = rawProps[key];
      if (key in propsOptions) {
        props[key] = value;
      } else attrs[key] = value;
    }
  }
  instance.props = reactive(props); // props 不需要深度代理， 组件不能更改props
  instance.attrs = attrs;
};

const publicProperty = {
  $attrs: (instance) => instance.attrs,
  // ...
};

const handler = {
  get(target, key) {
    const { data, props } = target;
    if (data && hasOwn(data, key)) {
      return data[key];
    } else if (props && hasOwn(props, key)) {
      return props[key];
    }
    // 对于一些无法修改的属性 $slots $attrs ... $attrs_> instance.attrs
    const getter = publicProperty[key];
    if (getter) {
      return getter(target);
    }
  },
  set(target, key, value) {
    const { data, props } = target;
    if (data && hasOwn(data, key)) {
      data[key] = value;
    } else if (props && hasOwn(props, key)) {
      // 用户可以修改属性中的嵌套属性，内部不会报错 但是不合法
      // props[key] = value;
      console.warn("props are readOnly");
    }
    return true;
  },
};

export function setupComponent(instance) {
  const { vnode } = instance;
  // 赋值属性
  initProps(instance, vnode.props);
  // 赋值代理对象
  instance.proxy = new Proxy(instance, handler);

  const { data, render } = vnode.type;
  if (!isFunction(data)) return console.warn("data option must be a function");
  // data中可以拿到props
  instance.data = reactive(data.call(instance.proxy));

  instance.render = render;
}
