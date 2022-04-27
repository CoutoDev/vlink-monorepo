#!/usr/bin/env node

const { resolve, dirname, relative } = require('path')
const { readdir, stat, writeFile, readFile } = require('fs').promises
const packageFile = './package.json'

async function* getFiles(rootPath) {
  const fileNames = await readdir(rootPath)
  for (const fileName of fileNames) {
    if (fileName) {
      const path = resolve(rootPath, fileName)
      if (
        (await stat(path)).isDirectory() &&
        !path.includes('node_modules') &&
        !path.includes('.')
      ) {
        yield* getFiles(path)
      } else {
        if(path.includes('manifest.json')) {
          yield dirname(path)
        }
      }
    }
  }
}

function concatScripts(scriptList) {
  const vlink = scriptList.reduce((acc, script) => {
    return acc.concat(' ', script.vlink)
  }, '')

  const vfix = scriptList.reduce((acc, script) => {
    return acc.concat(' ', script.vfix)
  }, '')

  return {
    vlink,
    vfix
  }
}

;(async () => {
  const scriptList = []
  const readedPackage = await readFile(packageFile, "utf-8")
  const jsonPackage = JSON.parse(readedPackage)

  for await (const file of getFiles('.')) {
    let relativePath = relative(__dirname, file)
    scriptList.push({
      vlink: `\"yarn vlink:${relativePath}\"`,
      vfix: `\"yarn vfix:${relativePath}\"`
    })
    jsonPackage.scripts[`vlink:${relativePath}`] = `cd ${relativePath} && vtex link`
    jsonPackage.scripts[`vfix:${relativePath}`] = `cd ${relativePath} && vtex unlink && vtex link`

    jsonPackage.scripts.vlink = `concurrently ${concatScripts(scriptList).vlink}`
    jsonPackage.scripts.vfix = `concurrently ${concatScripts(scriptList).vfix}`
  }
  console.log(jsonPackage)
  writeFile(packageFile, JSON.stringify(jsonPackage))
})()