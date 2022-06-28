# VLINK-MONOREPO
## A CLI tool that helps you to link your VTEX IO Components/Apps

<mark>Besides the name, this tool also works if you have multiple repos of the same project on the root folder that you want to run vlink.</mark>

### Install

`npm i -g vlink-monorepo`

Or

`yarn add global vlink-monorepo`

<mark>It's important that you have installed Yarn and globally installed version of 'concurrently' package to this tool to work.</mark>

### Install Yarn
`npm i -g yarn`

### Install concurrently
`npm i -g concurrently`

### Usage

Commands:
```
  link [componentFolder]  Link VTEX IO components
  fix [componentFolder]   Unlink and Link VTEX IO components
  help [command]          display help for command
```
### Examples:

`vlink link` -> Will run over all projects inside the current folder (basically sets the path like ".") and run vtex link if the manifest.json file exists on project.

`vlink fix` -> Same as link, but will unlink the project and then link again.

### You can also specify the project you want to link:
`vlink link customComponent`
