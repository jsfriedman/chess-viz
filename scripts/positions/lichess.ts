import { createReadStream, existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createZstdDecompress } from 'node:zlib'

// Downloads only the first `bytes` of a Lichess .zst export, cached so reruns work offline
export async function downloadSlice(url: string, bytes: number, cachePath: string): Promise<void> {
  if (existsSync(cachePath)) return
  console.info(`Downloading first ${Math.round(bytes / 1e6)} MB of ${url}`)
  const response = await fetch(url, { headers: { Range: `bytes=0-${bytes - 1}` } })
  if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText} for ${url}`)
  await mkdir(dirname(cachePath), { recursive: true })
  await writeFile(cachePath, Buffer.from(await response.arrayBuffer()))
}

// Streams lines from a truncated .zst slice; the decoder errors at the cut, which ends the stream
export async function* readLines(cachePath: string): AsyncGenerator<string> {
  const decoder = createReadStream(cachePath).pipe(createZstdDecompress())
  let pending = ''
  try {
    for await (const chunk of decoder) {
      const lines = (pending + chunk.toString('utf8')).split('\n')
      pending = lines.pop() ?? ''
      yield* lines
    }
  } catch (error) {
    if (!/end of file|truncated|unexpected end/i.test((error as Error).message)) throw error
  } finally {
    decoder.destroy()
  }
}
