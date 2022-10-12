const fs = require('fs')
const path = require('path')
const exist = fs.existsSync(path.join(__dirname, '../config.ts'))
if (!exist) {
  fs.cpSync(
    path.join(__dirname, '../config.example.ts'),
    path.join(__dirname, '../config.ts'),
  )
}
