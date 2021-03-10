const {
    existsSync, mkdirSync, readdirSync, lstatSync,
    copyFileSync, symlinkSync, readlinkSync
  } = require("fs");
const path = require("path");

function copyFolderSync(src, dest) {
    if (!existsSync(dest)) mkdirSync(dest)
  
    readdirSync(src).forEach(dirent => {
      const [srcPath, destPath] = [src, dest].map(dirPath => path.join(dirPath, dirent))
      const stat = lstatSync(srcPath)
  
      switch (true) {
        case stat.isFile():
          copyFileSync(srcPath, destPath); break
        case stat.isDirectory():
          copyFolderSync(srcPath, destPath); break
        case stat.isSymbolicLink():
          symlinkSync(readlinkSync(srcPath), destPath); break
      }
    })
  }
  
copyFolderSync("./../common/dist", "./dist/common")
copyFolderSync("./config", "./dist/config")