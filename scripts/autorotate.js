import sharp from 'sharp'
import { readdirSync, statSync, renameSync, unlinkSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join, relative } from 'path'
import { createHash } from 'crypto'

/*
  Rotates (bakes in EXIF orientation) and compresses every JPEG in
  public/images, then skips them on future runs via a content-hash cache.

  Without the cache, mozjpeg re-encoding isn't byte-stable — re-compressing
  an already-compressed JPEG produces slightly different bytes each run even
  at the same quality, so every image looked "changed" to git on every
  build and got re-uploaded by the FTP deploy step (tens of MB every push,
  regardless of what actually changed).

  The cache (scripts/image-cache.json, committed to the repo) maps each
  image's relative path to the hash of its last-known-processed content.
  A file is only touched when it's new or its bytes have genuinely changed.
*/

const CACHE_FILE = 'scripts/image-cache.json'

function loadCache() {
  if (!existsSync(CACHE_FILE)) return {}
  try {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf8'))
  } catch {
    return {}
  }
}

function hashFile(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

async function processDir(dir, cache, seen, stats) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      await processDir(fullPath, cache, seen, stats)
    } else if (/\.(jpe?g|jpg)$/i.test(entry)) {
      const key = relative('public/images', fullPath).split('\\').join('/')
      seen.add(key)

      const currentHash = hashFile(fullPath)
      if (cache[key] === currentHash) {
        stats.skipped++
        continue
      }

      const tmp = fullPath + '.tmp'
      const originalSize = statSync(fullPath).size
      await sharp(fullPath)
        .rotate()
        .jpeg({ quality: 82, progressive: true, mozjpeg: true })
        .toFile(tmp)
      const newSize = statSync(tmp).size
      unlinkSync(fullPath)
      renameSync(tmp, fullPath)

      cache[key] = hashFile(fullPath)
      stats.processed++
      const saving = Math.round((1 - newSize / originalSize) * 100)
      console.log(`  ${entry}: ${Math.round(originalSize / 1024)}KB → ${Math.round(newSize / 1024)}KB (${saving > 0 ? '-' + saving : '+' + Math.abs(saving)}%)`)
    }
  }
}

console.log('Auto-rotating + compressing images (cached — only new/changed files are touched)...')
const cache = loadCache()
const seen = new Set()
const stats = { processed: 0, skipped: 0 }
await processDir('public/images', cache, seen, stats)

// Drop stale entries for images that no longer exist
for (const key of Object.keys(cache)) {
  if (!seen.has(key)) delete cache[key]
}

writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n')
console.log(`Done. ${stats.processed} processed, ${stats.skipped} skipped (already up to date).`)
