#!/usr/bin/env node

const { resolve, dirname, relative, join } = require('path')
const { readdir, stat, writeFile, readFile } = require('fs').promises
const { program } = require('commander')
const fs = require('fs')
const shell = require('shelljs')

const package = require('./package.json')

program.version(package.version);

program
  .command('vlink [componentFolder]')
  .description('Link VTEX IO components')
  .action(async (componentFolder = '.') => {
    const data = {
      scripts: []
    };
    const scriptList = [];

    if (componentFolder === '.') {
      console.log(componentFolder);

      for await (const file of getFiles(componentFolder)) {
        let relativePath = relative(componentFolder, file)

        scriptList.push({
          vlink: `\"yarn vlink:${relativePath}\"`,
          vfix: `\"yarn vfix:${relativePath}\"`
        })

        data.scripts[`vlink:${relativePath}`] = `cd ${relativePath} && vtex link`
        data.scripts[`vfix:${relativePath}`] = `cd ${relativePath} && vtex unlink && vtex link`

        data.scripts.vlink = `yarn concurrently ${concatScripts(scriptList).vlink}`
        data.scripts.vfix = `yarn concurrently ${concatScripts(scriptList).vfix}`
      }

      console.log(data.scripts.vlink)
      shell.exec(data.scripts.vlink)
    }
  });

program.parse(process.argv);


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