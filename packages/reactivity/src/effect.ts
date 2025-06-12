import { DirtyLevels } from "./constants";

export function effect(fn, options?) {
  const _effect = new ReactiveEffect(fn, () => {
    // scheduler
    _effect.run();
  });
  // 初始化会执行一次
  _effect.run();
  if (options) {
    Object.assign(_effect, options); // 用户传递的覆盖掉内置的
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect; // 可以在run方法上获取到effect的引用
  return runner; // 将runner提供给外部手动执行
}

function preCleanEffect(effect) {
  effect._trackId++; // 每次执行id 都是 +1, 如果当前同一个effect执行，id就是相同的
  effect._depsLength = 0;
}

function postCleanEffect(effect) {
  // 删除多余的依赖
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect); // 删除映射表中的effect
    }
    effect.deps.length = effect._depsLength; // 更新依赖列表的长度
  }
}

export let activeEffect;
export class ReactiveEffect {
  _trackId = 0; // 用于记录当前的effect执行了几次
  _depsLength = 0;
  _running = 0; // 代表当前是否正在执行（处理effect存在递归的情况）
  _dirtyLevel = DirtyLevels.Dirty;
  deps = [];
  public active = true; // 用于控制effect的激活;
  // fn 用户编写的函数
  // fn 中依赖的数据发生变化之后，需要重新调用 run
  constructor(
    public fn,
    public scheduler,
  ) {}

  public get dirty() {
    return this._dirtyLevel === DirtyLevels.Dirty;
  }
  public set dirty(v) {
    this._dirtyLevel = v ? DirtyLevels.Dirty : DirtyLevels.NoDirty;
  }
  run() {
    this._dirtyLevel = DirtyLevels.NoDirty; // 每次运行后effect变成 no_dirty
    if (!this.active) {
      return this.fn(); // 不是激活的，执行之后就什么不用做了
    }

    // 通过lastEffect处理effect中递归effect的情况
    let lastEffect = activeEffect;
    try {
      activeEffect = this;

      // 每次收集依赖前，需要清理之前收集的依赖
      preCleanEffect(this);
      this._running++;
      return this.fn(); //依赖收集
    } finally {
      this._running--;
      activeEffect = lastEffect;
      postCleanEffect(this);
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      preCleanEffect(this);
      postCleanEffect(this);
    }
  }
}

function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size === 0) {
    dep.cleanup();
  }
}

// 将当前的effect放入dep映射表中去
// _trackId 用于记录执行次数 （防止一个属性在当前effect中多次依赖收集） 只收集一次
export const trackEffect = (effect, dep) => {
  // 需要重新去计算，将不需要的移除掉
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId);

    // 简单的依赖diff算法， 用于处理新旧依赖中的差异
    // 如第一次依赖时是[flag, name], 第二次是 [flag, age]
    let oldDep = effect.deps[effect._depsLength];
    // 如果没有存过
    if (oldDep !== dep) {
      if (oldDep) {
        // 删除老的
        cleanDepEffect(oldDep, effect);
      }
      effect.deps[effect._depsLength++] = dep; //  永远按照本次最新的来
    } else {
      effect._depsLength++;
    }
  }
};

export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    // 当前的这个值是不脏的，但是触发更新需要将值变为脏值
    if (!effect.dirty) {
      effect.dirty = true;
    }
    if (effect.scheduler && !effect._running) {
      effect.scheduler();
    }
  }
}
