// script.js - client-side image processor
const filesEl = document.getElementById('files')
const convertBtn = document.getElementById('convert')
const logEl = document.getElementById('log')
const aspectEl = document.getElementById('aspect')
const formatEl = document.getElementById('format')
const bgEl = document.getElementById('bgcolor')
const canvas = document.getElementById('hiddenCanvas')
const ctx = canvas.getContext('2d')

function log(msg){
  const p = document.createElement('div')
  p.textContent = msg
  logEl.appendChild(p)
}

function clearLog(){ logEl.innerHTML = '' }

function parseAspect(aspectStr){
  const [w,h] = aspectStr.split('/').map(Number)
  return {w,h}
}

function resizeAndCanvas(image, targetW, targetH, background){
  // create target canvas size
  canvas.width = targetW
  canvas.height = targetH

  // fill background
  ctx.fillStyle = background
  ctx.fillRect(0,0,canvas.width,canvas.height)

  // compute scaled dimensions preserving aspect ratio
  const ratio = Math.min(targetW / image.width, targetH / image.height)
  const drawW = Math.round(image.width * ratio)
  const drawH = Math.round(image.height * ratio)
  const offsetX = Math.round((targetW - drawW) / 2)
  const offsetY = Math.round((targetH - drawH) / 2)

  ctx.drawImage(image, 0,0, image.width, image.height, offsetX, offsetY, drawW, drawH)
}

async function processFile(file, aspect, outputFormat, background, suffix){
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try{
        // decide target pixel dimensions. We'll pick a reasonable max width based on orientation.
        // Keep target size within 2000px to avoid huge images on mobile.
        const maxLong = 2000
        const targetRatio = aspect.w / aspect.h
        // portrait: height > width
        const targetH = Math.min(maxLong, Math.max(800, Math.round(Math.max(img.width, img.height))))
        const targetW = Math.round(targetH * targetRatio)

        // If ratio calculation makes width larger than maxLong, clamp
        if(Math.max(targetW, targetH) > maxLong){
          if(targetW > targetH){
            const scale = maxLong / targetW
            canvas.width = Math.round(targetW * scale)
            canvas.height = Math.round(targetH * scale)
          } else {
            const scale = maxLong / targetH
            canvas.width = Math.round(targetW * scale)
            canvas.height = Math.round(targetH * scale)
          }
        }

        // For stable behavior compute precise target dimensions from aspect and a fixed long side.
        // We'll set finalHeight = 2000 (or smaller if original small) and compute width by ratio.
        const finalHeight = Math.min(maxLong, Math.max(1000, Math.round(img.height)))
        const finalWidth = Math.round(finalHeight * (aspect.w / aspect.h))

        resizeAndCanvas(img, finalWidth, finalHeight, background)

        canvas.toBlob((blob) => {
          if(!blob){
            reject(new Error('Export failed'))
            return
          }
          const outName = makeOutputName(file.name, suffix, outputFormat)
          triggerDownload(blob, outName)
          URL.revokeObjectURL(url)
          resolve(outName)
        }, outputFormat, outputFormat === 'image/jpeg' ? 0.92 : undefined)
      }catch(err){
        reject(err)
      }
    }
    img.onerror = (e) => reject(new Error('Image load error'))
    img.src = url
  })
}

function makeOutputName(original, suffix, format){
  const dot = original.lastIndexOf('.')
  const base = dot === -1 ? original : original.slice(0,dot)
  const ext = format === 'image/png' ? 'png' : 'jpg'
  return `${base}${suffix}.${ext}`
}

function triggerDownload(blob, filename){
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 5000)
}

convertBtn.addEventListener('click', async () => {
  clearLog()
  const files = Array.from(filesEl.files || [])
  if(files.length === 0){ log('No files selected'); return }

  convertBtn.disabled = true
  const aspect = parseAspect(aspectEl.value)
  const format = formatEl.value
  const bg = bgEl.value || '#2E2E2E'
  const suffix = '_converted'

  log(`Processing ${files.length} file(s)...`)

  for(const f of files){
    try{
      log(`Processing ${f.name}...`)
      const out = await processFile(f, aspect, format, bg, suffix)
      log(`Downloaded ${out}`)
    }catch(err){
      log(`Error processing ${f.name}: ${err.message || err}`)
    }
  }

  log('All done')
  convertBtn.disabled = false
})
