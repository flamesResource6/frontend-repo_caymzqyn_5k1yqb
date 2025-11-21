export default function SheetPreview({ cardPx, rows, cols, spacing, margin, page, previewUrl }) {
  const pageSizes = {
    A4: { w: 2480, h: 3508 }, // 300 DPI
    Letter: { w: 2550, h: 3300 },
    A3: { w: 3508, h: 4961 },
  }
  const pagePx = pageSizes[page] || pageSizes.A4

  const items = []
  let y = margin
  for (let r=0; r<rows; r++) {
    let x = margin
    for (let c=0; c<cols; c++) {
      items.push({ x, y })
      x += cardPx.width + spacing
    }
    y += cardPx.height + spacing
  }

  return (
    <div className="w-full bg-white rounded-xl p-4 overflow-auto border border-slate-200">
      <div className="relative mx-auto" style={{ width: pagePx.w/2, height: pagePx.h/2, background: '#f8fafc' }}>
        {items.map((it, idx) => (
          <div key={idx} className="absolute bg-white shadow border border-slate-200 overflow-hidden"
            style={{ left: it.x/2, top: it.y/2, width: cardPx.width/2, height: cardPx.height/2 }}>
            {previewUrl && <img src={previewUrl} alt="card" className="w-full h-full object-contain" />}
          </div>
        ))}
      </div>
    </div>
  )
}
