import { useState } from 'react'

export default function RightPanel({ selected, onUpdateBackground, background, onUpdateElement }) {
  const [bg, setBg] = useState(background || {})

  const handleBgImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onUpdateBackground({ ...bg, image: reader.result })
    reader.readAsDataURL(file)
  }

  return (
    <aside className="w-full lg:w-72 bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-4">
      <h3 className="text-white font-semibold">Properties</h3>

      <div className="space-y-2">
        <p className="text-xs text-blue-200/70">Background</p>
        <input type="file" accept="image/*" onChange={handleBgImage} className="w-full text-xs" />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button className={`p-2 rounded ${bg.mode==='fill'?'bg-blue-600 text-white':'bg-slate-700/60 text-blue-100'}`} onClick={() => onUpdateBackground({ ...bg, mode: 'fill' })}>Fill</button>
          <button className={`p-2 rounded ${bg.mode==='fit'?'bg-blue-600 text-white':'bg-slate-700/60 text-blue-100'}`} onClick={() => onUpdateBackground({ ...bg, mode: 'fit' })}>Fit</button>
          <button className={`p-2 rounded ${bg.mode==='stretch'?'bg-blue-600 text-white':'bg-slate-700/60 text-blue-100'}`} onClick={() => onUpdateBackground({ ...bg, mode: 'stretch' })}>Stretch</button>
          <button className={`p-2 rounded ${bg.mode==='manual'?'bg-blue-600 text-white':'bg-slate-700/60 text-blue-100'}`} onClick={() => onUpdateBackground({ ...bg, mode: 'manual' })}>Manual</button>
        </div>
        <label className="text-xs text-blue-200/70">Opacity</label>
        <input type="range" min="0" max="1" step="0.01" value={bg.opacity ?? 1} onChange={(e)=> onUpdateBackground({ ...bg, opacity: parseFloat(e.target.value) })} />
        <label className="text-xs text-blue-200/70">Scale</label>
        <input type="range" min="0.1" max="3" step="0.01" value={bg.scale ?? 1} onChange={(e)=> onUpdateBackground({ ...bg, scale: parseFloat(e.target.value) })} />
        <div className="flex items-center gap-2">
          <input id="locked" type="checkbox" checked={bg.locked ?? true} onChange={(e)=> onUpdateBackground({ ...bg, locked: e.target.checked })} />
          <label htmlFor="locked" className="text-xs text-blue-200/80">Lock background</label>
        </div>
      </div>

      {selected && (
        <div className="space-y-2">
          <p className="text-xs text-blue-200/70">Selected Element</p>
          <label className="text-xs text-blue-200/70">X</label>
          <input type="number" className="w-full bg-slate-700/60 text-white text-xs p-1 rounded" value={selected.props?.x||0} onChange={(e)=> onUpdateElement({ ...selected, props: { ...selected.props, x: parseFloat(e.target.value) } })} />
          <label className="text-xs text-blue-200/70">Y</label>
          <input type="number" className="w-full bg-slate-700/60 text-white text-xs p-1 rounded" value={selected.props?.y||0} onChange={(e)=> onUpdateElement({ ...selected, props: { ...selected.props, y: parseFloat(e.target.value) } })} />
          <label className="text-xs text-blue-200/70">Width</label>
          <input type="number" className="w-full bg-slate-700/60 text-white text-xs p-1 rounded" value={selected.props?.width||120} onChange={(e)=> onUpdateElement({ ...selected, props: { ...selected.props, width: parseFloat(e.target.value) } })} />
          <label className="text-xs text-blue-200/70">Height</label>
          <input type="number" className="w-full bg-slate-700/60 text-white text-xs p-1 rounded" value={selected.props?.height||60} onChange={(e)=> onUpdateElement({ ...selected, props: { ...selected.props, height: parseFloat(e.target.value) } })} />
        </div>
      )}
    </aside>
  )
}
