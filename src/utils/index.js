/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

/**
 * 数组去重
 */
export function uniqueArray(arr) {
  return Array.from(new Set(arr))
}

export function diffArrays(arr1, arr2) {
  arr1 = uniqueArray(arr1)
  arr2 = uniqueArray(arr2)

  return arr1.concat(arr2)
    .filter(arg => !(arr1.includes(arg) && arr2.includes(arg)))
}

export function eqArrays(arr1, arr2) {
  arr1 = uniqueArray(arr1)
  arr2 = uniqueArray(arr2)

  const newArr = []
  for (let i = 0; i < arr2.length; i++) {
    for (let j = 0; j < arr1.length; j++) {
      if (arr1[j] === arr2[i]) {
        newArr.push(arr1[j])
      }
    }
  }

  return newArr
}

/**
 * 生成随机唯一字符串
 * @returns {string}
 */
export function generateUniqueString() {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * 格式化类目，用于选择器
 * @param categories 所有商品分类
 */
export function generateCategorySelector(categories) {
  return categories.map(category => {
    const data = {
      'value': category.id,
      'label': category.name
    }
    if (category.children) {
      data.children = generateCategorySelector(category.children)
    }
    return data
  })
}

/**
 * 构造树型结构数据
 *
 * @param data        数据源
 * @param id 字段     默认 'id'
 * @param parentId    父节点字段 默认 'parent_id'
 * @param children    子节点字段 默认 'children'
 * @param rootId      根Id 默认 0
 * @returns {*}
 */
export function generateTree(data, id, parentId, children, rootId) {
  id = id || 'id'
  parentId = parentId || 'parent_id'
  children = children || 'children'
  rootId = rootId || Math.min.apply(Math, data.map(item => { return item[parent_id] })) || 0

  // 对源数据深度克隆
  const cloneData = JSON.parse(JSON.stringify(data))

  // 循环所有项
  const treeData = cloneData.filter(father => {
    const branchArr = cloneData.filter(child => {
      // 返回每一项的子级数组
      return father[id] === child[parent_id]
    })
    branchArr.length > 0 ? father.children = branchArr : ''
    // 返回第一层
    return father[parent_id] === rootId
  })

  return treeData != '' ? treeData : data
}

/**
 * 重置表单
 *
 * @param refName
 */
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields()
  }
}

/**
 * 字段值的数据字典转换
 *
 * @param dictionaries
 * @param value
 *
 * @returns {string}
 */
export function selectDictLabel(dictionaries, value) {
  let actions = []
  Object.keys(dictionaries).some((key) => {
    if (dictionaries[key].value == value) {
      actions.push(dictionaries[key].lavel)
      return true
    }
  })
  return actions.join('')
}
