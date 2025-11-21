import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Hero from './components/Hero'
import Toolbar from './components/Toolbar'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import EditorCanvas from './components/EditorCanvas'
import SheetPreview from './components/SheetPreview'
import * as XLSX from 'xlsx'

const DEFAULT_SIZE = { widthMM: 85.6, heightMM: 54, dpi: 300, bleedMM: 3, orientation: 'landscape' }

const READY_TEMPLATES = [
  {
    name: 'Modern School',
    data: {
      size: DEFAULT_SIZE,
      background: { mode: 'fill', opacity: 1, locked: true, image: '' },
      elements: [
        { id: 't1', type: 'text', props: { x: 24, y: 24, width: 260, fontSize: 20, color: '#111', text: 'School Name', fontWeight: '700' }, bind: { text: 'school' } },
        { id: 'p1', type: 'photo', props: { x: 24, y: 60, width: 120, height: 120, clip: 'circle', src: '' }, bind: { src: 'photo' } },
        { id: 'n1', type: 'text', props: { x: 160, y: 80, width: 260, fontSize: 18, color: '#111', text: 'Name' }, bind: { text: 'name' } },
        { id: 'r1', type: 'text', props: { x: 160, y: 110, width: 260, fontSize: 14, color: '#334155', text: 'Role' }, bind: { text: 'role' } },
        { id: 'q1', type: 'qr', props: { x: 300, y: 140, size: 80, value: '123' }, bind: { value: 'qrPayload' } },
      ]
    }
  },
  {
    name: 'Corporate Minimal',
    data: {
      size: DEFAULT_SIZE,
      background: { mode: 'fit', opacity: 1, locked: true, image: '' },
      elements: [
        { id: 'logo', type: 'logo', props: { x: 24, y: 20, width: 80, src: '' }, bind: { src: 'logo' } },
        { id: 'name', type: 'text', props: { x: 24, y: 120, width: 260, fontSize: 18, text: 'Full Name', fontWeight: '600' }, bind: { text: 'name' } },
        { id: 'id', type: 'text', props: { x: 24, y: 150, width: 200, fontSize: 12, text: 'ID: 0000' }, bind: { text: 'id' } },
        { id: 'qr', type: 'qr', props: { x: 300, y: 120, size: 80, value: 'QR' }, bind: { value: 'qrPayload' } },
      ]
    }
  }
]

function App() {
  const backend = import.meta.env.VITE_BACKEND_URL || ''

  // Template state
  const [templates, setTemplates] = useState(READY_TEMPLATES)
  const [template, setTemplate] = useState(READY_TEMPLATES[0])

  // Editor state
  const [size, setSize] = useState(template.data.size)
  const [background, setBackground] = useState(template.data.background)
  const [elements, setElements] = useState(template.data.elements)

  // Data bindings
  const [dataRow, setDataRow] = useState({ name: 'Alex Johnson', role: 'Student', id: 'S-1023', qrPayload: 'S-1023' })

  // Selection tracking
  const [selectedIds, setSelectedIds] = useState([])
  const selected = useMemo(() => elements.find(e=> e.id === selectedIds[0]), [selectedIds, elements])

  useEffect(()=>{
    setSize(template.data.size)
    setBackground(template.data.background)
    setElements(template.data.elements)
  }, [template])

  const onAdd = (type) => {
    const id = `${type}-${Date.now()}`
    const base = { x: 40, y: 40, width: 160, height: 60 }
    const propsBy = {
      text: { text: 'Text', fontSize: 16, color: '#111' },
      image: { src: '', width: 120, height: 80 },
      photo: { src: '', width: 120, height: 120, clip: 'circle' },
      logo: { src: '', width: 80 },
      qr: { size: 100, value: 'QR' },
      rect: { width: 160, height: 80, fill: '#e5e7eb', radius: 8 },
    }
    setElements(prev => [...prev, { id, type, props: { ...base, ...propsBy[type] }, bind: {} }])
  }

  const onUpdateElement = (el) => {
    setElements(prev => prev.map(p => p.id === el.id ? el : p))
  }

  const onCanvasChange = (updated) => {
    setElements(prev => prev.map(p => updated.find(u=>u.id===p.id) || p))
  }

  // Export single card as PNG (uses HTML canvas toDataURL via screenshot of editor canvas element)
  const canvasImageUrlRef = useRef(null)
  const setCanvasPreview = (url) => { canvasImageUrlRef.current = url }

  // Template import/export
  const downloadTemplate = () => {
    const json = JSON.stringify({ size, background, elements, bindings: Object.keys(dataRow) }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `template-${Date.now()}.json`
    a.click()
  }

  const uploadTemplate = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        setTemplate({ name: data.name || 'Imported Template', data })
      } catch (err) { alert('Invalid template JSON') }
    }
    reader.readAsText(file)
  }

  // Excel/CSV import
  const [rows, setRows] = useState([])
  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
    setRows(data)
  }

  // Print sheet config
  const cardPx = useMemo(() => ({
    width: Math.round((size.widthMM + (size.bleedMM||0)*2) * (size.dpi/25.4)),
    height: Math.round((size.heightMM + (size.bleedMM||0)*2) * (size.dpi/25.4)),
  }), [size])

  const [sheet, setSheet] = useState({ rows: 4, cols: 2, spacing: 30, margin: 30, page: 'A4' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Hero />

      <section id="editor" className="relative max-w-7xl mx-auto p-4 md:p-8 space-y-4">
        <Toolbar onAdd={onAdd} />

        <div className="grid lg:grid-cols-[16rem_1fr_18rem] gap-4">
          <LeftPanel
            templates={templates}
            onLoadTemplate={(t)=> setTemplate(t)}
            onDownloadTemplate={downloadTemplate}
            onUploadTemplate={uploadTemplate}
            onImportExcel={handleImportExcel}
          />

          <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 overflow-auto">
            <EditorCanvas
              size={size}
              background={background}
              elements={elements}
              onChange={onCanvasChange}
              bindings={dataRow}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          </div>

          <RightPanel
            selected={selected}
            background={background}
            onUpdateBackground={setBackground}
            onUpdateElement={onUpdateElement}
          />
        </div>

        {/* Data form (single card) */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Manual Data</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {['name','role','id','qrPayload','school','logo','photo'].map((k)=> (
                <label key={k} className="space-y-1">
                  <span className="block text-blue-200/70">{k}</span>
                  <input className="w-full bg-slate-700/60 p-2 rounded" value={dataRow[k]||''} onChange={(e)=> setDataRow(prev=> ({...prev, [k]: e.target.value}))} />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Batch Preview</h3>
            <div className="max-h-48 overflow-auto text-sm bg-slate-900/40 rounded border border-slate-700/60">
              <table className="w-full">
                <thead className="bg-slate-800/60">
                  <tr>
                    {rows[0] && Object.keys(rows[0]).map(h => (<th key={h} className="text-left p-2">{h}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r,i)=> (
                    <tr key={i} className="odd:bg-slate-800/40">
                      {Object.values(r).map((v,j)=> (<td key={j} className="p-2">{String(v)}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Print sheet */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold">Print Sheet Layout</h3>
          <div className="grid md:grid-cols-5 gap-3 text-sm">
            <label className="space-y-1"><span className="block text-blue-200/70">Rows</span><input type="number" className="w-full bg-slate-700/60 p-2 rounded" value={sheet.rows} onChange={(e)=> setSheet(s=> ({...s, rows: parseInt(e.target.value||'0')}))} /></label>
            <label className="space-y-1"><span className="block text-blue-200/70">Cols</span><input type="number" className="w-full bg-slate-700/60 p-2 rounded" value={sheet.cols} onChange={(e)=> setSheet(s=> ({...s, cols: parseInt(e.target.value||'0')}))} /></label>
            <label className="space-y-1"><span className="block text-blue-200/70">Spacing(px)</span><input type="number" className="w-full bg-slate-700/60 p-2 rounded" value={sheet.spacing} onChange={(e)=> setSheet(s=> ({...s, spacing: parseInt(e.target.value||'0')}))} /></label>
            <label className="space-y-1"><span className="block text-blue-200/70">Margin(px)</span><input type="number" className="w-full bg-slate-700/60 p-2 rounded" value={sheet.margin} onChange={(e)=> setSheet(s=> ({...s, margin: parseInt(e.target.value||'0')}))} /></label>
            <label className="space-y-1"><span className="block text-blue-200/70">Page</span>
              <select className="w-full bg-slate-700/60 p-2 rounded" value={sheet.page} onChange={(e)=> setSheet(s=> ({...s, page: e.target.value}))}>
                <option>A4</option>
                <option>A3</option>
                <option>Letter</option>
              </select>
            </label>
          </div>

          <SheetPreview cardPx={cardPx} rows={sheet.rows} cols={sheet.cols} spacing={sheet.spacing} margin={sheet.margin} page={sheet.page} previewUrl={canvasImageUrlRef.current} />
        </div>
      </section>
    </div>
  )
}

export default App
