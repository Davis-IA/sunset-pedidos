import { useState } from 'react'
import { formatWhatsAppMessage } from '../utils/formatMessage'

const WA_NUMBER = '50377490453'

export default function OrderSummary({ cart, user, subtotal, onRemove, onUpdateDrink, onBack }) {
  const [logoError, setLogoError] = useState(false)

  const dishes = cart.filter((item) => item.type === 'dish')
  const selectedDrinks = cart.filter((item) => item.type === 'drink')

  const handleConfirm = () => {
    const message = formatWhatsAppMessage(user, cart, subtotal)
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="min-h-screen min-h-dvh bg-[#F5F5F5] flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen min-h-dvh">

        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
          {logoError ? (
            <span className="text-sunset font-bold text-lg">Sunset</span>
          ) : (
            <img
              src="/logo.png"
              alt="Sunset"
              className="h-11 w-11 object-contain flex-shrink-0"
              onError={() => setLogoError(true)}
            />
          )}
          <span className="font-bold text-[#1a1a1a] text-lg">Tu pedido</span>
        </div>

        <div className="px-4 py-5">

          {/* Dish items */}
          {dishes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🛒</p>
              <p className="text-[#888888]">Tu pedido está vacío</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {dishes.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1a1a1a] text-sm leading-tight">
                      {item.quantity}x {item.name}
                    </p>
                    <p className="text-[#888888] text-xs mt-1 leading-snug">
                      {item.isSopa
                        ? '2 tortillas'
                        : `${item.acompañamiento} + ${item.ensalada} + 2 tortillas`}
                    </p>
                    <p className="text-sunset font-bold text-sm mt-1.5">
                      ${(item.priceNum * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(item.cartId)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-2xl leading-none flex-shrink-0 mt-0.5"
                    aria-label="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drinks — only shows drinks already added from the menu */}
          {selectedDrinks.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-[#1a1a1a] text-base mb-3">🥤 Bebidas</h3>
              <div className="space-y-2">
                {selectedDrinks.map((drink) => (
                  <div
                    key={drink.name}
                    className="flex items-center justify-between bg-[#FAFAFA] rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-[#1a1a1a] text-sm">{drink.name}</p>
                      <p className="text-sunset text-sm font-semibold">
                        ${(drink.priceNum * drink.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onUpdateDrink(drink.name, -1)}
                        className="w-9 h-9 rounded-full border-2 border-sunset text-sunset text-lg font-bold flex items-center justify-center active:opacity-70"
                      >
                        −
                      </button>
                      <span className="text-[#1a1a1a] font-bold w-5 text-center tabular-nums text-base">
                        {drink.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateDrink(drink.name, 1)}
                        className="w-9 h-9 rounded-full bg-sunset text-white text-lg font-bold flex items-center justify-center active:opacity-70 transition-opacity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider + subtotal */}
          <div className="border-t border-gray-100 pt-4 mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[#1a1a1a] text-lg">Subtotal</span>
              <span className="text-sunset font-bold text-xl tabular-nums">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <p className="text-[#888888] text-xs">
              El costo de envío se confirma con tu pedido
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pb-8">
            <button
              onClick={handleConfirm}
              className="w-full bg-sunset text-white font-semibold py-4 rounded-2xl text-base active:opacity-80 transition-opacity shadow-md"
            >
              📲 Confirmar pedido por WhatsApp
            </button>
            <button
              onClick={onBack}
              className="w-full border-2 border-sunset text-sunset font-semibold py-4 rounded-2xl text-base bg-white active:bg-orange-50 transition-colors"
            >
              ← Seguir agregando
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
