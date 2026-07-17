const fs = require('fs')
const path = require('path')

function processDirectory(dir, depth) {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      processDirectory(fullPath, depth + 1)
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8')
      
      // Calculate correct relative path to server/utils
      const relativeUp = Array(depth).fill('..').join('/') || '.'
      const correctPath = `${relativeUp}/utils`
      
      // Replace any combinations of ../../../utils with correctPath
      const regex = /(?:(?:\.\.\/)+)utils/g
      
      if (regex.test(content)) {
        content = content.replace(regex, correctPath)
        fs.writeFileSync(fullPath, content)
        console.log(`Updated ${fullPath} with ${correctPath}`)
      }
    }
  }
}

// Start from server/api with depth 2 (since server/api is 2 levels deep from server/utils? No, server/api is 1 level deep from server. Wait.
// server/api -> depth 2 means it needs `../../utils`.
// Let's verify:
// server/api/file.ts -> needs `../utils` (depth 1)
// server/api/users/file.ts -> needs `../../utils` (depth 2)
// server/api/users/[id]/file.ts -> needs `../../../utils` (depth 3)

processDirectory(path.join(__dirname, 'server', 'api'), 1)
