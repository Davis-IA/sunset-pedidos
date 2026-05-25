import { useState } from 'react'

// Strip formatting characters, keep only digits
function digitsOnly(str) {
  return str.replace(/\D/g, '')
}

// Rule: no pure ascending or descending sequence (e.g. 12345678, 87654321)
function isSequential(digits) {
  if (digits.length < 2) return false
  const ascending  = digits.split('').every((d, i) => i === 0 || +d - +digits[i - 1] === 1)
  const descending = digits.split('').every((d, i) => i === 0 || +d - +digits[i - 1] === -1)
  return ascending || descending
}

// Rule: no repeating 2-digit pair pattern (e.g. 58585858, 12121212)
function isRepeatingPair(digits) {
  if (digits.length < 4 || digits.length % 2 !== 0) return false
  const pair = digits.slice(0, 2)
  return digits.match(/.{2}/g).every((p) => p === pair)
}

function validateTel(raw) {
  const trimmed = raw.trim()
  const digits = digitsOnly(trimmed)

  // Format: Option A — SV number (8 digits, starts with 6 or 7, dash allowed)
  const isOptionA = /^[67]\d{7}$/.test(digits)
  // Format: Option B — international (purely numeric, ≥ 10 digits)
  const isOptionB = /^\d+$/.test(trimmed) && trimmed.length >= 10

  if (!isOptionA && !isOptionB) return false

  // Quality rules (apply to both options)
  if (digits.startsWith('00'))      return false  // rule 1: no leading "00"
  if (/^(\d)\1+$/.test(digits))     return false  // rule 2: no all-same digits
  if (isSequential(digits))         return false  // rule 3: no pure sequence
  if (isRepeatingPair(digits))      return false  // rule 4: no repeating pair

  return true
}

function validateNombre(raw) {
  return raw.trim().length >= 2
}

export default function UserForm({ onSubmit }) {
  const [nombre, setNombre] = useState('')
  const [tel, setTel] = useState('')
  const [errors, setErrors] = useState({})
  const [logoError, setLogoError] = useState(false)

  const nombreValid = validateNombre(nombre)
  const telValid = validateTel(tel)
  const canSubmit = nombreValid && telValid

  const handleTelBlur = () => {
    if (tel.trim() && !telValid) {
      setErrors((prev) => ({ ...prev, tel: 'Ingresa un número de teléfono válido' }))
    }
  }

  const handleNombreBlur = () => {
    if (nombre.trim() && !nombreValid) {
      setErrors((prev) => ({ ...prev, nombre: 'Ingresa al menos 2 caracteres' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    // Store digits-only for the tel (keeps international prefixes intact)
    onSubmit({ nombre: nombre.trim(), tel: digitsOnly(tel) })
  }

  return (
    <div className="min-h-screen min-h-dvh bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[430px] bg-white rounded-2xl shadow-md p-6 animate-scale-in">
        <div className="text-center mb-6">
          {logoError ? (
            <p className="text-3xl font-bold text-sunset">Sunset Sabor Casero</p>
          ) : (
            <img
              src="/logo.png"
              alt="Sunset Sabor Casero"
              className="w-24 h-24 mx-auto object-contain"
              onError={() => setLogoError(true)}
            />
          )}
          <h1 className="text-xl font-bold text-[#1a1a1a] mt-3">¡Bienvenido!</h1>
          <p className="text-[#888888] text-sm mt-1">
            Ingresa tus datos para ver el menú del día
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">
              Tu nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value)
                if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: '' }))
              }}
              onBlur={handleNombreBlur}
              placeholder="Ej: María García"
              autoComplete="name"
              className={`w-full border rounded-xl px-4 py-3 text-base outline-none transition-colors ${
                errors.nombre
                  ? 'border-red-400 bg-red-50'
                  : nombreValid
                  ? 'border-green-400 focus:border-green-500'
                  : 'border-gray-200 focus:border-sunset'
              }`}
            />
            {errors.nombre && (
              <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">
              Tu teléfono
            </label>
            <input
              type="tel"
              value={tel}
              onChange={(e) => {
                setTel(e.target.value)
                if (errors.tel) setErrors((prev) => ({ ...prev, tel: '' }))
              }}
              onBlur={handleTelBlur}
              placeholder="Ej: 7654-3210"
              autoComplete="tel"
              className={`w-full border rounded-xl px-4 py-3 text-base outline-none transition-colors ${
                errors.tel
                  ? 'border-red-400 bg-red-50'
                  : telValid
                  ? 'border-green-400 focus:border-green-500'
                  : 'border-gray-200 focus:border-sunset'
              }`}
            />
            {errors.tel && (
              <p className="text-red-500 text-xs mt-1">{errors.tel}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full font-semibold py-3.5 rounded-xl text-base mt-2 transition-all duration-200 ${
              canSubmit
                ? 'bg-sunset text-white active:opacity-80'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Ver menú del día →
          </button>
        </form>
      </div>
    </div>
  )
}
