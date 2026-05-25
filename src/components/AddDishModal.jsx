import { useState, useEffect } from 'react'

const ACOMPAÑAMIENTOS = ['Arroz', 'Casamiento']
const ENSALADAS = ['Ensalada fresca', 'Chimol']

export default function AddDishModal({ dish, onClose, onConfirm }) {
  const [acompañamiento, setAcompañamiento] = useState('Arroz')
  const [ensalada, setEnsalada] = useState('Ensalada fresca')
  const [quantity, setQuantity] = useState(1)

  const isSopa =
    dish.name.toLowerCase().includes('sopa') ||
    dish.description?.toLowerCase().includes('sin acompañamientos')

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const lineTotal = (dish.priceNum * quantity).toFixed(2)
  const showPrice = dish.priceNum > 0

  const handleConfirm = () => {
    onConfirm({
      type: 'dish',
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      priceNum: dish.priceNum,
      isSopa,
      acompañamiento: isSopa ? '' : acompañamiento,
      ensalada: isSopa ? '' : ensalada,
      quantity,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl px-5 pt-5 pb-8 animate-slide-up shadow-2xl">
        {/* Handle bar */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <h3 className="font-bold text-[#1a1a1a] text-lg flex-1 pr-4 leading-tight">
            {dish.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 text-2xl leading-none w-8 h-8 flex items-center justify-center flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* Acompañamiento + Ensalada — hidden for sopas */}
        {isSopa ? (
          <div className="mb-5 bg-[#F8FAF5] rounded-2xl px-4 py-3">
            <p className="text-sm text-[#4a7c59] font-medium">✓ Incluye 2 tortillas</p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Acompañamiento</p>
              <div className="flex gap-2 flex-wrap">
                {ACOMPAÑAMIENTOS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAcompañamiento(opt)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      acompañamiento === opt
                        ? 'bg-sunset text-white font-semibold'
                        : 'bg-[#F0F0F0] text-[#555555]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Ensalada</p>
              <div className="flex gap-2 flex-wrap">
                {ENSALADAS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setEnsalada(opt)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      ensalada === opt
                        ? 'bg-sunset text-white font-semibold'
                        : 'bg-[#F0F0F0] text-[#555555]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Quantity */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Cantidad</p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-11 h-11 rounded-full border-2 border-sunset text-sunset text-xl font-bold flex items-center justify-center active:opacity-70 transition-opacity"
            >
              −
            </button>
            <span className="text-2xl font-bold text-[#1a1a1a] w-6 text-center tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-11 h-11 rounded-full bg-sunset text-white text-xl font-bold flex items-center justify-center active:opacity-70 transition-opacity"
            >
              +
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <button
          onClick={handleConfirm}
          className="w-full bg-sunset text-white font-semibold py-4 rounded-2xl text-base mb-3 active:opacity-80 transition-opacity"
        >
          Añadir al pedido{showPrice ? ` — $${lineTotal}` : ''}
        </button>
        <button
          onClick={onClose}
          className="w-full border border-gray-200 text-[#888888] font-medium py-3.5 rounded-2xl text-base active:opacity-70 transition-opacity"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
