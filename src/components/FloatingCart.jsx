export default function FloatingCart({ itemCount, subtotal, onViewOrder }) {
  if (itemCount === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-5 pointer-events-none">
      <div className="w-full max-w-[430px] pointer-events-auto animate-slide-up">
        <button
          onClick={onViewOrder}
          className="w-full bg-sunset text-white font-semibold py-4 rounded-2xl shadow-xl flex items-center justify-between px-5 text-base active:opacity-90 transition-opacity"
        >
          <span className="flex items-center gap-2">
            <span>🛒</span>
            <span>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} · ${subtotal.toFixed(2)}
            </span>
          </span>
          <span className="text-white/90">Ver pedido →</span>
        </button>
      </div>
    </div>
  )
}
