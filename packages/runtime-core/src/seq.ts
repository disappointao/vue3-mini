// 获取最长递增子序列的索引
export function getSequence(arr) {
  const result = [0]; // 初始化默认将数组的第一项作为开始
  const p = result.slice(0); //用于存放索引
  const len = arr.length;
  let start;
  let end;
  let middle;
  for (let i = 0; i < len; i++) {
    const cur = arr[i];
    if (cur !== 0) {
      // vue3 序号为0代表是一个新增的节点，不用考虑
      // 拿出结果集对应的最后一项，和我当前的这一项作对比
      let resultLastIndex = result[result.length - 1];
      if (arr[resultLastIndex] < cur) {
        p[i] = result[result.length - 1]; // 正常放入的时候，前一个节点索引就是result中的最后一个
        result.push(i); //  直接将当前的索引放入到结果集即可
        continue;
      }
    }
    start = 0;
    end = result.length - 1;
    while (start < end) {
      middle = ((start + end) / 2) | 0; // 向下取整 3.5 」 0 => 3

      if (arr[result[middle]] < cur) {
        start = middle + 1;
      } else {
        end = middle;
      }
    }
    if (cur < arr[result[start]]) {
      p[i] = result[start - 1]; // 找到的那个节点的前一个
      result[start] = i;
    }
  }
  // p 为前驱节点的列表， 需要根据最后一个节点做追述
  let l = result.length;
  let last = result[l - 1]; // 取出最后一项
  while (l-- > 0) {
    result[l] = last;
    last = p[last]; // 在数组中找到最后一个
  }

  // 需要创建一个前驱节点，进行倒序追述，（因为最后一项是不会错的）
  return result;
}
