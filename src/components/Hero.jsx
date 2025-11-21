import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative min-h-[60vh] grid lg:grid-cols-2 items-center">
      <div className="p-8 lg:p-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
          Pro ID Card Generator
        </h1>
        <p className="text-blue-200 text-lg md:text-xl mb-6 max-w-xl">
          Design, import data from Excel, auto-bind fields, and export pixel-perfect PNG and PDF at 300 DPI. Perfect for schools, companies, and organizations.
        </p>
        <a href="#editor" className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors">
          Start Designing
        </a>
      </div>
      <div className="relative h-[360px] md:h-[520px]">
        <Spline scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
      </div>
    </section>
  )
}
