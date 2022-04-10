const fs = require('fs')
const path = require('path')
const exist = fs.existsSync(path.join(__dirname, '../config.json'))
if (!exist) {
  fs.cpSync(
    path.join(__dirname, '../config.example'),
    path.join(__dirname, '../config.ts'),
  )
}
