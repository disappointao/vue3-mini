function createInvoker(handler) {
  const invoker = (e) => invoker.value(e);
  invoker.value = handler; //  更改invoker中value 函数 可以修改对应的应用调用 （用于优化性能，不用一直删除，绑定dom的事件）
}

export default function patchEvent(el, name, handler) {
  //  vue_event_invoker
  const invokers = el._vei || (el.vei = {});
  const eventName = name.slice(2).toLowerCase();

  const existInvokers = invokers[name]; // 是否存在同名的事件绑定

  if (handler && existInvokers) {
    return (existInvokers.value = handler); // 事件换绑
  }

  if (handler) {
    const invoker = (invokers[name] = createInvoker(handler)); // 创建一个调用函数，并且内部会执行handler
    return el.addEventListener(eventName, invoker);
  }
  if (existInvokers) {
    // 现在没有，以前有
    el.removeEventListener(eventName, existInvokers);
    invokers[name] = undefined;
  }
}
