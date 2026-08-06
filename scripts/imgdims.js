import sharp from 'sharp'
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

/*
  Injects width/height attributes into every <img> tag in the HTML files,
  based on the real pixel dimensions of the source image.

  This reserves the correct box before the image loads, which:
    • stops CSS-columns masonry from re-flowing / images "flashing & jumping"
    • eliminates Cumulative Layout Shift (CLS)
  Idempotent: skips any <img> that already declares width or height.
*/

const PUBLIC_DIR = 'public'
const dimCache = new Map()

async function getDims(srcPath) {
  if (dimCache.has(srcPath)) return dimCache.get(srcPath)
  const file = join(PUBLIC_DIR, srcPath)
  if (!existsSync(file)) {
    console.warn(`  ! not found: ${srcPath}`)
    return null
  }
  const { width, height } = await sharp(file).metadata()
  const dims = { width, height }
  dimCache.set(srcPath, dims)
  return dims
}

async function processHtml(file) {
  let html = readFileSync(file, 'utf8')
  const imgTags = [...html.matchAll(/<img\b[^>]*>/g)].map(m => m[0])
  let changed = 0

  let corrected = 0

  for (const tag of imgTags) {
    const srcMatch = tag.match(/src\s*=\s*["']([^"']+)["']/)
    if (!srcMatch) continue
    let src = srcMatch[1]
    if (!src.startsWith('images/')) continue

    const dims = await getDims(src)
    if (!dims) continue

    const wMatch = tag.match(/\bwidth\s*=\s*["'](\d+)["']/)
    const hMatch = tag.match(/\bheight\s*=\s*["'](\d+)["']/)

    if (wMatch && hMatch) {
      // Already declared - correct it if the file has since been replaced at a
      // different size. Stale values are worse than none: they reserve the wrong
      // box and reintroduce the layout shift this script exists to prevent.
      if (+wMatch[1] === dims.width && +hMatch[1] === dims.height) continue
      const newTag = tag
        .replace(/\bwidth\s*=\s*["']\d+["']/, `width="${dims.width}"`)
        .replace(/\bheight\s*=\s*["']\d+["']/, `height="${dims.height}"`)
      html = html.replace(tag, newTag)
      corrected++
      continue
    }

    if (wMatch || hMatch) continue // half-declared by hand, leave alone

    const newTag = tag.replace(/^<img\b/, `<img width="${dims.width}" height="${dims.height}"`)
    html = html.replace(tag, newTag)
    changed++
  }

  if (changed || corrected) {
    writeFileSync(file, html)
    const parts = []
    if (changed) parts.push(`added dimensions to ${changed} images`)
    if (corrected) parts.push(`corrected ${corrected} stale`)
    console.log(`  ${file}: ${parts.join(', ')}`)
  } else {
    console.log(`  ${file}: nothing to do`)
  }
}

console.log('Injecting image dimensions into HTML...')
for (const f of readdirSync('.')) {
  if (f.endsWith('.html')) await processHtml(f)
}
console.log('Done.')
