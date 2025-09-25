// script.js - client-side image processor
const filesEl = document.getElementById('files')
const convertBtn = document.getElementById('convert')
const logEl = document.getElementById('log')
const aspectEl = document.getElementById('aspect')
const formatEl = document.getElementById('format')
const bgEl = document.getElementById('bgcolor')
const sharedCanvas = document.getElementById('hiddenCanvas')

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

// Process a file: load into an Image, create a temporary canvas sized for the target aspect,
// draw the scaled image centered on the background, then export.
async function processFile(file, aspect, outputFormat, background, suffix){
  const url = URL.createObjectURL(file)
  try{
    const img = await loadImage(url)

    // Determine final dimensions. Use a reasonable max size to avoid huge exports.
    const maxLong = 2000
    // Use portrait (height) as the long side by default for portrait aspect ratios
    const aspectRatio = aspect.w / aspect.h

    // Start from the image's natural sizes but clamp to maxLong
    const nativeLong = Math.max(img.width, img.height)
    const longSide = Math.min(maxLong, Math.max(1000, nativeLong))

    // For the chosen aspect, compute target width/height where height is the long side
    // This gives a portrait-oriented canvas when aspectRatio < 1 (e.g. 4/5)
    const targetHeight = Math.round(longSide)
    const targetWidth = Math.round(targetHeight * aspectRatio)

    // Create an offscreen canvas per file to avoid shared state issues
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')

    // Fill background
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Compute scaled image size preserving aspect ratio
    const ratio = Math.min(canvas.width / img.width, canvas.height / img.height)
    const drawW = Math.round(img.width * ratio)
    const drawH = Math.round(img.height * ratio)
    const offsetX = Math.round((canvas.width - drawW) / 2)
    const offsetY = Math.round((canvas.height - drawH) / 2)

    ctx.drawImage(img, 0, 0, img.width, img.height, offsetX, offsetY, drawW, drawH)

    // Export
    const blob = await canvasToBlob(canvas, outputFormat)
    const outName = makeOutputName(file.name, suffix, outputFormat)
    triggerDownload(blob, outName)
    return outName
  }finally{
    URL.revokeObjectURL(url)
  }
}

function loadImage(url){
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(new Error('Image load error'))
    img.src = url
  })
}

function canvasToBlob(canvas, type){
  return new Promise((resolve) => {
    // default quality used by browser when undefined is fine; supply for jpeg
    if(type === 'image/jpeg'){
      canvas.toBlob((b) => resolve(b), type, 0.92)
    } else {
      canvas.toBlob((b) => resolve(b), type)
    }
  })
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
