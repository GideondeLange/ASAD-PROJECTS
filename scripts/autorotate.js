import sharp from 'sharp'
import { readdirSync, statSync, renameSync, unlinkSync } from 'fs'
import { join, extname } from 'path'

async function processDir(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      await processDir(fullPath)
    } else if (/\.(jpe?g|jpg)$/i.test(entry)) {
      const tmp = fullPath + '.tmp'
      const originalSize = statSync(fullPath).size
      await sharp(fullPath)
        .rotate()
        .jpeg({ quality: 82, progressive: true, mozjpeg: true })
        .toFile(tmp)
      const newSize = statSync(tmp).size
      unlinkSync(fullPath)
      renameSync(tmp, fullPath)
      const saving = Math.round((1 - newSize / originalSize) * 100)
      console.log(`  ${entry}: ${Math.round(originalSize/1024)}KB → ${Math.round(newSize/1024)}KB (${saving > 0 ? '-' + saving : '+' + Math.abs(saving)}%)`)
    }
  }
}

console.log('Auto-rotating + compressing images...')
await processDir('public/images')
console.log('Done.')
