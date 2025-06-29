const queue = []; // 缓存当前要执行的队列
let isFlushing = false;
const resolvePromise = Promise.resolve();

// 如果同时在一个组件中更新多个转态 job肯定是同一个
// 同时开启一个异步任务
// 通过事件循环机制，延迟更新操作
export function queueJob(job) {
  if (!queue.includes(job)) {
    // 去重同名
    queue.push(job); // 让任务进入队列
  }
  if (!isFlushing) {
    isFlushing = true;
    resolvePromise.then(() => {
      isFlushing = false;
      const copy = queue.slice(0);
      queue.length = 0;
      copy.forEach((job) => job());
      copy.length = 0;
    });
  }
}
