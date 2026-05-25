export default function ErrorScreen() {
  return (
    <div className="min-h-screen min-h-dvh bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[430px] bg-white rounded-2xl shadow-md p-8 text-center animate-scale-in">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
          No pudimos cargar el menú de hoy 😔
        </h2>
        <p className="text-[#888888] mb-6 text-sm">
          Por favor contáctanos directamente:
        </p>
        <a
          href="https://wa.me/50377490453"
          target="_blank"
          rel="noreferrer"
          className="block w-full bg-sunset text-white font-semibold py-3.5 rounded-xl text-base text-center active:opacity-80 transition-opacity"
        >
          💬 Contactar a Sunset
        </a>
      </div>
    </div>
  )
}
