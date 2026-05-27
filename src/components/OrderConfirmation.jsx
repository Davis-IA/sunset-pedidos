import { useState } from 'react'

export default function OrderConfirmation({ cart, subtotal, orderId, onAddMore, onNewOrder }) {
  const [logoError, setLogoError] = useState(false)

  const dishes = cart.filter((item) => item.type === 'dish')
  const drinks = cart.filter((item) => item.type === 'drink')

  return (
    <div className="min-h-screen min-h-dvh bg-[#F5F5F5] flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen min-h-dvh flex flex-col">

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
          <span className="font-bold text-[#1a1a1a] text-lg">Pedido enviado</span>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">

          {/* Success icon + title */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#FFF4E0] flex items-center justify-center mx-auto mb-4">
              <svg
                viewBox="0 0 24 24"
                className="w-10 h-10 text-sunset"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">¡Pedido enviado!</h2>
            <p className="text-[#888888] text-sm leading-snug">
              Sunset Sabor Casero confirmará tu pedido pronto
            </p>
          </div>

          {/* Order ID badge */}
          {orderId && (
            <div className="flex justify-center mb-5">
              <span className="bg-[#FFF4E0] text-sunset font-bold text-sm px-4 py-1.5 rounded-full tracking-wide">
                Pedido {orderId}
              </span>
            </div>
          )}

          {/* Read-only order summary */}
          <div className="space-y-3 mb-4">
            {dishes.map((item) => (
              <div
                key={item.cartId}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1a1a1a] text-sm leading-tight">
                      {item.quantity}x {item.name}
                    </p>
                    {item.details && (
                      <p className="text-[#888888] text-xs mt-1 leading-snug">
                        {item.details}
                      </p>
                    )}
                  </div>
                  <p className="text-sunset font-bold text-sm flex-shrink-0">
                    ${(item.priceNum * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            {drinks.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <p className="font-bold text-[#1a1a1a] text-sm mb-2">🥤 Bebidas</p>
                <div className="space-y-1.5">
                  {drinks.map((item) => (
                    <div key={item.cartId} className="flex items-center justify-between">
                      <p className="text-[#555555] text-sm">
                        {item.quantity}x {item.name}
                      </p>
                      <p className="text-sunset font-bold text-sm">
                        ${(item.priceNum * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-gray-100 pt-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1a1a1a] text-lg">Total</span>
              <span className="text-sunset font-bold text-xl tabular-nums">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <p className="text-[#888888] text-xs mt-1">Sin costo de envío incluido</p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pb-4">
            <button
              onClick={onAddMore}
              className="w-full border-2 border-sunset text-sunset font-semibold py-4 rounded-2xl text-base bg-white active:bg-orange-50 transition-colors"
            >
              + Agregar algo más
            </button>
            <button
              onClick={onNewOrder}
              className="w-full bg-sunset text-white font-semibold py-4 rounded-2xl text-base active:opacity-80 transition-opacity"
            >
              Hacer otro pedido
            </button>
          </div>

          {/* Close hint */}
          <p className="text-center text-[#BBBBBB] text-xs pb-6">
            Puedes cerrar esta ventana
          </p>

        </div>
      </div>
    </div>
  )
}
