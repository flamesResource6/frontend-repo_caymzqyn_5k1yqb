import { useEffect, useRef, useState, useMemo } from 'react'
import { fabric } from 'fabric'
import QRCode from 'qrcode'

const px = (mm, dpi) => (mm / 25.4) * dpi

export default function EditorCanvas({
  size, // {widthMM,heightMM,dpi,bleedMM,orientation}
  background, // {mode:'fit|fill|stretch|manual', image, scale, opacity, locked}
  elements, // [{id,type,props,bind}]
  onChange,
  bindings,
  selectedIds,
  setSelectedIds,
}) {
  const canvasRef = useRef(null)
  const fabricRef = useRef(null)
  const [ready, setReady] = useState(false)

  const pxSize = useMemo(() => ({
    width: Math.round(px(size.widthMM + (size.bleedMM||0)*2, size.dpi)),
    height: Math.round(px(size.heightMM + (size.bleedMM||0)*2, size.dpi)),
  }), [size])

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: pxSize.width,
      height: pxSize.height,
      backgroundColor: 'white',
      preserveObjectStacking: true,
      selection: true,
    })
    fabricRef.current = canvas

    // Snap to grid
    const grid = 10
    canvas.on('object:moving', (e) => {
      const obj = e.target
      if (!obj) return
      obj.set({
        left: Math.round(obj.left / grid) * grid,
        top: Math.round(obj.top / grid) * grid,
      })
    })

    // Selection tracking
    const updateSelection = () => {
      const active = canvas.getActiveObjects() || []
      setSelectedIds(active.map(o => o.customId))
    }
    canvas.on('selection:created', updateSelection)
    canvas.on('selection:updated', updateSelection)
    canvas.on('selection:cleared', () => setSelectedIds([]))

    setReady(true)

    return () => {
      canvas.dispose()
      fabricRef.current = null
    }
  }, [])

  // Render background
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !ready) return
    canvas.setBackgroundColor(null, canvas.renderAll.bind(canvas))
    if (background?.image) {
      fabric.Image.fromURL(background.image, (img) => {
        const cw = canvas.getWidth()
        const ch = canvas.getHeight()
        const iw = img.width
        const ih = img.height
        let scaleX = cw / iw
        let scaleY = ch / ih
        let scale = 1
        if (background.mode === 'fill') scale = Math.max(scaleX, scaleY)
        else if (background.mode === 'fit') scale = Math.min(scaleX, scaleY)
        else if (background.mode === 'stretch') {
          img.set({ scaleX, scaleY })
        } else if (background.mode === 'manual') {
          scale = background.scale || 1
        }
        if (background.mode !== 'stretch') {
          img.set({ scaleX: scale, scaleY: scale })
        }
        img.set({ selectable: !background.locked, evented: !background.locked, opacity: background.opacity ?? 1 })
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas))
      }, { crossOrigin: 'anonymous' })
    } else {
      canvas.renderAll()
    }
  }, [background, ready, pxSize])

  // Render elements
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !ready) return

    canvas.getObjects().forEach(o => { if (!o.background) canvas.remove(o) })

    const add = (el) => {
      const common = { left: el.props.x || 50, top: el.props.y || 50, angle: el.props.rotation || 0, opacity: el.props.opacity ?? 1 }
      let obj
      if (el.type === 'text') {
        obj = new fabric.Textbox(resolveBinding(el, 'text'), {
          ...common,
          fill: el.props.color || '#111',
          fontSize: el.props.fontSize || 16,
          fontWeight: el.props.fontWeight || 'normal',
          fontFamily: el.props.fontFamily || 'Inter, system-ui',
          width: el.props.width || 200,
          textAlign: el.props.align || 'left'
        })
      } else if (el.type === 'image' || el.type === 'photo' || el.type === 'logo') {
        obj = new fabric.Image.fromURL(resolveBinding(el, 'src'), (img) => {
          img.set({ ...common })
          if (el.props.width) img.scaleToWidth(el.props.width)
          if (el.props.height) img.scaleToHeight(el.props.height)
          if (el.props.clip === 'circle') {
            const r = (el.props.width || 120) / 2
            img.set({ clipPath: new fabric.Circle({ radius: r, originX: 'center', originY: 'center' }) })
          }
          img.customId = el.id
          canvas.add(img)
          canvas.renderAll()
        }, { crossOrigin: 'anonymous' })
        return
      } else if (el.type === 'rect') {
        obj = new fabric.Rect({ ...common, fill: el.props.fill || '#e5e7eb', width: el.props.width || 120, height: el.props.height || 60, rx: el.props.radius || 0, ry: el.props.radius || 0 })
      } else if (el.type === 'qr') {
        const data = resolveBinding(el, 'value') || 'QR'
        const size = el.props.size || 120
        const canvasQR = document.createElement('canvas')
        QRCode.toCanvas(canvasQR, data, { width: size, margin: 0 })
        const img = new fabric.Image(canvasQR, { ...common })
        img.scaleToWidth(size)
        obj = img
      }
      if (obj) {
        obj.customId = el.id
        obj.hasControls = true
        canvas.add(obj)
      }
    }

    elements.forEach(add)
    canvas.renderAll()
  }, [elements, bindings, ready])

  // Update outgoing changes
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !ready) return

    const onModify = () => {
      const updated = canvas.getObjects().filter(o => !o.background).map((o, idx) => ({
        id: o.customId || `el-${idx}`,
        type: o.type === 'textbox' ? 'text' : (o.type === 'image' ? 'image' : o.type === 'rect' ? 'rect' : 'unknown'),
        props: {
          x: o.left,
          y: o.top,
          width: o.width * o.scaleX,
          height: o.height * o.scaleY,
          rotation: o.angle,
          opacity: o.opacity,
        }
      }))
      onChange && onChange(updated)
    }

    const canvasEvents = ['object:moving','object:modified','object:scaling','object:rotating']
    canvasEvents.forEach(evt => canvas.on(evt, onModify))
    return () => canvasEvents.forEach(evt => canvas.off(evt, onModify))
  }, [ready, onChange])

  const resolveBinding = (el, key) => {
    if (!el.bind || !el.bind[key]) return el.props?.[key]
    const field = el.bind[key]
    return bindings?.[field] ?? el.props?.[key]
  }

  return (
    <div className="w-full h-full overflow-auto">
      <canvas ref={canvasRef} width={pxSize.width} height={pxSize.height} />
    </div>
  )
}
