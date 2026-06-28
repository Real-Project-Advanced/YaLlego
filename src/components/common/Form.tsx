'use client';

import { ReactNode, useState } from 'react';
// IMPORTANT: Standard icons from lucide-react replace raw SVGs for cleaner, tailwind-ready customization
import { Check, X, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';

/* ── VALIDATION HELPERS ────────────────────────── */

// Validates email format using regex
function validateEmail(v: string) {
  if (!v) return { type: 'error', msg: 'El correo electrónico es requerido.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    return { type: 'error', msg: 'Ingresa un correo válido (ej. tu@email.com).' };
  return { type: 'success', msg: 'El formato del correo es válido.' };
}

// Validates password strength and gives constructive feedback
function validatePassword(v: string) {
  if (!v) return { type: 'error', msg: 'La contraseña es requerida.' };
  if (v.length < 8) return { type: 'error', msg: `Mínimo 8 caracteres (llevas ${v.length}).` };
  if (!/[A-Z]/.test(v))
    return {
      type: 'warning',
      msg: 'Tu contraseña funcionará, pero te recomendamos incluir al menos una mayúscula para mayor seguridad.',
    };
  if (!/[0-9]/.test(v))
    return {
      type: 'warning',
      msg: 'Tu contraseña es aceptable, pero incluir al menos un número la haría mucho más robusta.',
    };
  return { type: 'success', msg: '¡Contraseña excelente y muy segura!' };
}

// Calculates dynamic password strength score from 0 to 4
function passwordStrength(v: string): { label: string; width: string; color: string } {
  if (!v || v.length < 4) return { label: '', width: '0%', color: '#e2e8f0' };
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;

  const map = [
    { label: 'Muy débil', width: '20%', color: '#ef4444' },
    { label: 'Débil', width: '40%', color: '#f97316' },
    { label: 'Regular', width: '60%', color: '#eab308' },
    { label: 'Fuerte', width: '80%', color: '#22c55e' },
    { label: 'Muy fuerte', width: '100%', color: '#10b981' },
  ];
  return map[score] ?? map[0];
}

// Validates name field length
function validateName(v: string) {
  if (!v) return { type: 'error', msg: 'El nombre es requerido.' };
  if (v.trim().length < 2) return { type: 'error', msg: 'Por favor, ingresa tu nombre completo.' };
  return { type: 'success', msg: 'Nombre válido.' };
}

/* ── STATUS CARD BELOW INPUT ───────────────────── */

function ValidationMsg({ result }: { result: { type: string; msg: string } | null }) {
  // CRITICAL: Do not render anything if there is no message
  if (!result?.msg) return null;

  // Maps states to specific Tailwind classes and dynamic Lucide components
  const cfg = {
    error: {
      cardCls: 'bg-red-50 border-red-200 text-red-800 ring-red-50',
      Icon: X,
    },
    success: {
      cardCls: 'bg-emerald-50 border-emerald-200 text-emerald-800 ring-emerald-50',
      Icon: Check,
    },
    warning: {
      cardCls: 'bg-amber-50 border-amber-200 text-amber-800 ring-amber-50',
      Icon: AlertTriangle,
    },
  }[result.type as 'error' | 'success' | 'warning'] ?? {
    cardCls: 'bg-red-50 border-red-200 text-red-800',
    Icon: X,
  };

  return (
    // Note: text-left enforces proper card layout alignment regardless of parent centering
    <div
      className={`mt-2.5 flex items-start gap-2.5 p-3 rounded-lg border text-left text-xs font-medium shadow-sm transition-all duration-200 animate-in fade-in slide-in-from-top-1 ${cfg.cardCls}`}
    >
      <span className="mt-0.5 flex-shrink-0 opacity-90">
        <cfg.Icon className="h-4 w-4 stroke-[2.5]" />
      </span>
      <div className="leading-relaxed flex-1">{result.msg}</div>
    </div>
  );
}

/* ── INPUT FIELD WITH LIVE BORDERS ──────────────── */

export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  validate?: 'email' | 'password' | 'name' | 'none';
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder = '',
  required = false,
  autoComplete,
  validate = 'none',
}: FormFieldProps) {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false); // Tracks if user has clicked out of the input
  const [showPass, setShowPass] = useState(false); // Controls password visibility toggle
  const isPassword = type === 'password';

  // Computed state: Validates strictly on condition to prevent showing errors on empty, pristine fields
  const result = (() => {
    if (!touched || !value) return null;
    if (validate === 'email') return validateEmail(value);
    if (validate === 'password') return validatePassword(value);
    if (validate === 'name') return validateName(value);
    return null;
  })();

  const strength = isPassword && value ? passwordStrength(value) : null;

  // Global standard inputs style
  const baseInputClass =
    'w-full px-3.5 py-2.5 rounded-lg border text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 text-sm shadow-sm';

  // Changes the input field border and ring color dynamically based on validity state
  const statusInputClass = (() => {
    if (!touched || !result) return 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/10';
    if (result.type === 'error')
      return 'border-red-400 focus:border-red-500 focus:ring-red-500/10 bg-red-50/10';
    if (result.type === 'warning')
      return 'border-amber-400 focus:border-amber-500 focus:ring-amber-500/10 bg-amber-50/10';
    return 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10 bg-emerald-50/10';
  })();

  const inputType = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    // text-left ensures form contents don't inherit layout alignments like text-center
    <div className="w-full block text-left">
      <label
        className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5"
        htmlFor={name}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          id={name}
          className={`${baseInputClass} ${statusInputClass}`}
          type={inputType}
          name={name}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)} // Sets touched state once user clicks out
          style={isPassword ? { paddingRight: '2.75rem' } : {}} // Prevents text from going under show/hide button
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Password strength visual meter - only shows for active passwords */}
      {strength && value && (
        <div className="mt-2.5 px-0.5">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{ width: strength.width, backgroundColor: strength.color }}
            />
          </div>
          {strength.label && (
            <p
              className="mt-1 text-[10px] font-bold tracking-wider uppercase"
              style={{ color: strength.color }}
            >
              Seguridad: {strength.label}
            </p>
          )}
        </div>
      )}

      {/* Appends the status notification card directly beneath */}
      <ValidationMsg result={result} />
    </div>
  );
}

/* ── FORM GLOBAL ALERT CARD ────────────────────── */

export function AlertCard({
  type,
  title,
  msg,
}: {
  type: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  msg: string;
}) {
  const cfg = {
    error: { cls: 'bg-red-50 border-red-200 text-red-800', Icon: X },
    success: { cls: 'bg-emerald-50 border-emerald-200 text-emerald-800', Icon: Check },
    warning: { cls: 'bg-amber-50 border-amber-200 text-amber-800', Icon: AlertTriangle },
    info: { cls: 'bg-blue-50 border-blue-200 text-blue-800', Icon: AlertTriangle },
  }[type];

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm text-left ${cfg.cls}`}>
      <span className="mt-0.5 flex-shrink-0">
        <cfg.Icon className="h-4 w-4" />
      </span>
      <div>
        {title && <p className="font-bold text-sm mb-0.5">{title}</p>}
        <p className="text-sm leading-relaxed">{msg}</p>
      </div>
    </div>
  );
}

/* ── BASIC FORM WRAPPER ────────────────────────── */

export interface FormProps {
  children: ReactNode;
  action: (formData: FormData) => Promise<any> | any;
  className?: string;
}

export function Form({ children, action, className = '' }: FormProps) {
  return (
    <form action={action} className={`space-y-5 ${className}`}>
      {children}
    </form>
  );
}

/* ── BUTTON COMPONENT WITH LOADING SPINNER ───────── */

export interface FormButtonProps {
  children: ReactNode;
  type?: 'submit' | 'button' | 'reset';
  variant?: 'primary' | 'secondary';
  className?: string;
  loading?: boolean;
}

export function FormButton({
  children,
  type = 'submit',
  variant = 'primary',
  className = '',
  loading = false,
}: FormButtonProps) {
  const baseButtonClass =
    'w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed';

  const variantClass =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.99]';

  return (
    <button
      type={type}
      disabled={loading}
      className={`${baseButtonClass} ${variantClass} ${className}`}
    >
      {/* Renders a running Lucide spin loader dynamically when state is saving/loading */}
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-current" />
          <span>Procesando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
