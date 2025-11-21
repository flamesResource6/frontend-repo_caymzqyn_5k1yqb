import { useRef } from 'react'
import { Upload, FileJson, Save } from 'lucide-react'

export default function LeftPanel({ templates, onLoadTemplate, onDownloadTemplate, onUploadTemplate, onImportExcel }) {
  const fileRef = useRef(null)
  const excelRef = useRef(null)

  return (
    <aside className="w-full lg:w-64 bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Templates</h3>
        <button onClick={onDownloadTemplate} className="text-blue-300 hover:text-white">
          <Save size={18} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((t) => (
          <button key={t.id || t.name} onClick={() => onLoadTemplate(t)} className="bg-slate-700/40 hover:bg-slate-700 text-white text-xs p-2 rounded">
            {t.name}
          </button>
        ))}
      </div>

      <div className="h-px bg-slate-700/50" />

      <div className="space-y-2">
        <button onClick={() => fileRef.current.click()} className="w-full inline-flex items-center justify-center gap-2 bg-slate-700/60 hover:bg-slate-700 text-white py-2 rounded">
          <FileJson size={16} /> Upload Template JSON
        </button>
        <input type="file" accept="application/json" className="hidden" ref={fileRef} onChange={onUploadTemplate} />
      </div>

      <div className="space-y-2">
        <button onClick={() => excelRef.current.click()} className="w-full inline-flex items-center justify-center gap-2 bg-blue-600/90 hover:bg-blue-600 text-white py-2 rounded">
          <Upload size={16} /> Import Excel/CSV
        </button>
        <input type="file" accept=".xlsx,.xls,.csv" className="hidden" ref={excelRef} onChange={onImportExcel} />
      </div>
    </aside>
  )
}
