
import fs from 'fs'
import path from 'path'
import { DEF } from './consts.js'

// [同步] 检查文件/目录是否存在
const isExist = filePath => {
  return fs.existsSync(path.resolve(filePath))
}

// [同步] 检查是否为文件
const isFile = (file) => {
  if (!isExist(file)) return false
  let stat = fs.statSync(path.resolve(file))
  return stat.isFile()
}

// [同步] 检查是否为目录
const isDirectory = (dir) => {
  if (!isExist(dir)) return false
  let stat = fs.statSync(path.resolve(dir))
  return stat.isDirectory()
}

// [异步] 读文件夹内文件列表（第一级目录下）
const readDir = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path.resolve(dir), (err, files) => {
      if (err) return reject(err)
      files = files || []
      return resolve(files)
    })
  })
}

// 路径后缀名
const getExtname = (filepath, filterDot = false) => {
  let ext = path.extname(filepath).toLocaleLowerCase()
  if (filterDot && ext.length >= 2 && ext[0] === '.') {
    return ext.slice(1)
  }
  return ext
}

const getId = () => { return new Date().getTime() }

const getFileIcon = (fileIcons, filePath) => {
  let ext = getExtname(filePath)
  if (fileIcons[ext] && fileIcons[ext].name && fileIcons[ext].color) {
    return fileIcons[ext]
  } else {
    return fileIcons['*']
  }
}

/**
 * @function 递归地遍历文件目录，返回所有文件清单
 * @param {String} dir 文件目录
 * @param {Object} options 可选
 *                 - options.include: 只包含include中的文件 ['.xy', '.a', ... ]
 *                 - options.maxLevel: 最多遍历到的层级
 *                 - options.currLevel: 当前层级
 */
const listDir = async (dir, fileIcons, options = {}) => {
  if (!(options && typeof options === 'object')) throw new Error('Invalid options')
  if (!isDirectory(dir)) throw new Error(`Invalid directory: ${dir}`)

  let include = (Array.isArray(options.include) && options.include.length > 0) ? options.include : null
  let maxLevel = (typeof options.maxLevel === 'number' && options.maxLevel > 0) ? options.maxLevel : 0
  let currLevel = (typeof options.currLevel === 'number' && options.currLevel > 0) ? options.currLevel : 1

  let dirData = {
    id: getId(),
    label: options.name || path.basename(dir),
    path: path.resolve(dir),
    type: DEF.TYPE_DIRECTORY,
    hovering: false,
    level: currLevel,
    lastExpandable: (maxLevel && ((currLevel + 1) === maxLevel)),
    children: []
  }

  if (maxLevel && currLevel === maxLevel) {
    return dirData
  }

  let files = await readDir(dir)
    .catch(err => { throw err })
  for (let i = 0; i < files.length; i++) {
    let filename = files[i]
    let filePath = path.resolve(dir, filename)
    if (isDirectory(filePath)) {
      let subDirData = await listDir(filePath, fileIcons, { ...options, currLevel: currLevel + 1 })
        .catch(err => { throw err })
      dirData.children.push(subDirData)
    } else if (isFile(filePath)) {
      if (include && !include.includes(getExtname(filePath))) continue
      dirData.children.push({
        id: getId(),
        label: filename,
        path: filePath,
        type: DEF.TYPE_FILE,
        icon: getFileIcon(fileIcons, filePath)
      })
    }
  }

  dirData.children.sort((a, b) => { return a.type - b.type })

  return dirData
}


export {
  isExist,
  isFile,
  isDirectory,
  listDir,
  getExtname
}
