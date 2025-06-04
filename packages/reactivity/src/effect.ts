export function effect(fn, options?) {
  const _effect = new ReactiveEffect(fn, () => {
    // scheduler
    _effect.run();
  });
  // 初始化会执行一次
  _effect.run();
}
export let activeEffect;
class ReactiveEffect {
  public active = true; // 用于控制effect的激活;
  // fn 用户编写的函数
  // fn 中依赖的数据发生变化之后，需要重新调用 run
  constructor(
    public fn,
    public scheduler,
  ) {}
  run() {
    if (!this.active) {
      return this.fn(); // 不是激活的，执行之后就什么不用做了
    }

    // 通过lastEffect处理effect中递归effect的情况
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn(); //依赖收集
    } finally {
      activeEffect = lastEffect;
    }
  }
}
