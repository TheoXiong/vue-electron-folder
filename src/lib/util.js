/**
 * @function 根据指定的key，检查数组中是否包含此项。 isInArray([{a:1},{a:2}], 'a', 2)  => true
 * @param {Array} a 数组
 * @param {String} k 指定key
 * @param {Any} v 匹配的值
 */
export const isInArray = (a, k, v) => {
  return a.some(i => { return i[k] === v })
}

/**
 * @function 根据指定长度对文本进行截断。文本字符串原始长度小于指定长度时，返回原始字符串；文本字符串长度大于指定长度时，尾部补省略符
 * @param {String} str 文本字符串
 * @param {Number} len 指定的长度
 * @param {String} ellipsis 省略符号
 */
export const truncateText = (str, len, ellipsis = '...') => {
  if (!(typeof str === 'string' && typeof len === 'number' && typeof ellipsis === 'string' && (len > ellipsis.length))) {
    throw new Error('Invalid params.')
  }
  if (str.length <= len) {
    return str
  } else {
    let contentLen = len - ellipsis.length
    let content = str.slice(0, contentLen)
    return content + ellipsis
  }
}