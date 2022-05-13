#!/usr/bin/env node

const { resolve, dirname, relative, join } = require('path')
const { readdir, stat, writeFile, readFile } = require('fs').promises
const { program } = require('commander')
const fs = require('fs')
const shell = require('shelljs')

const package = require('./package.json')

program.version(package.version)

program
  .command('link [componentFolder]')
  .description('Link VTEX IO components')
  .action(async (componentFolder) => {
    const scriptList = ['yarn concurrently']
    componentFolder = componentFolder ?? '.'

    for await (const file of getFiles(componentFolder)) {
      const relativePath = relative(componentFolder, file)

      scriptList.push(`"cd ${relativePath} && vtex link"`)
    }
    shell.exec(scriptList.join(' '))
  });

program
  .command('fix [componentFolder]')
  .description('Unlink and Link VTEX IO components')
  .action(async (componentFolder) => {
    const scriptList = ['yarn concurrently']
    componentFolder = componentFolder ?? '.'

    for await (const file of getFiles(componentFolder)) {
      const relativePath = relative(componentFolder, file)

      scriptList.push(`"cd ${relativePath} && vtex unlink && vtex link"`)
    }
    shell.exec(scriptList.join(' '))

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
