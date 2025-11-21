import { Image, Type, QrCode, Square, UserRound, Layers, Save, Upload } from 'lucide-react'

export default function Toolbar({ onAdd }) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-xl p-2">
      <button onClick={() => onAdd('text')} className="px-3 py-2 rounded bg-slate-700/60 hover:bg-slate-700 text-white inline-flex items-center gap-2"><Type size={16}/>Text</button>
      <button onClick={() => onAdd('image')} className="px-3 py-2 rounded bg-slate-700/60 hover:bg-slate-700 text-white inline-flex items-center gap-2"><Image size={16}/>Image</button>
      <button onClick={() => onAdd('photo')} className="px-3 py-2 rounded bg-slate-700/60 hover:bg-slate-700 text-white inline-flex items-center gap-2"><UserRound size={16}/>Photo</button>
      <button onClick={() => onAdd('logo')} className="px-3 py-2 rounded bg-slate-700/60 hover:bg-slate-700 text-white inline-flex items-center gap-2"><Layers size={16}/>Logo</button>
      <button onClick={() => onAdd('qr')} className="px-3 py-2 rounded bg-slate-700/60 hover:bg-slate-700 text-white inline-flex items-center gap-2"><QrCode size={16}/>QR</button>
      <button onClick={() => onAdd('rect')} className="px-3 py-2 rounded bg-slate-700/60 hover:bg-slate-700 text-white inline-flex items-center gap-2"><Square size={16}/>Shape</button>
    </div>
  )
}
