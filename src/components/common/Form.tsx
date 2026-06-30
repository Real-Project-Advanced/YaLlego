'use client';

import { ReactNode, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
// Form icons.
import { Check, X, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';

// Email validation.
function validateEmail(v: string) {
  if (!v) return { type: 'error', msg: 'El correo es requerido.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    return { type: 'error', msg: 'Ingresa un correo valido (ej. tu@email.com).' };
  return { type: 'success', msg: 'Correo valido.' };
}

// Login password validation.
function validateLoginPassword(v: string) {
  if (!v) return { type: 'error', msg: 'La contrasena es requerida.' };
  return { type: 'success', msg: 'Contrasena ingresada.' };
}

// Password strength.
function passwordStrength(v: string): { label: string; width: string; color: string } {
  let score = 0;
  if (v.length >= 8) score++;
  if (/[a-z]/.test(v)) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;

  if (score <= 2) return { label: 'Baja', width: '33%', color: '#ef4444' };
  if (score === 3) return { label: 'Media', width: '66%', color: '#eab308' };
  if (score === 4) return { label: 'Segura', width: '85%', color: '#22c55e' };
  return { label: 'Super segura', width: '100%', color: '#10b981' };
}

// Register password validation.
function validateRegisterPassword(v: string) {
  if (!v) return { type: 'error', msg: 'La contrasena es requerida.' };
  if (v.length < 8) return { type: 'error', msg: `Minimo 8 caracteres (llevas ${v.length}).` };
  if (!/[A-Z]/.test(v)) return { type: 'error', msg: 'Agrega una letra mayuscula.' };
  if (!/[a-z]/.test(v)) return { type: 'error', msg: 'Agrega una letra minuscula.' };
  if (!/[0-9]/.test(v)) return { type: 'error', msg: 'Agrega un numero.' };

  const strength = passwordStrength(v);
  if (strength.label === 'Super segura')
    return { type: 'success', msg: 'Contrasena super segura.' };
  return { type: 'success', msg: 'Contrasena segura.' };
}

// Name validation.
function validateName(v: string) {
  if (!v) return { type: 'error', msg: 'El nombre es requerido.' };
  if (v.trim().length < 2) return { type: 'error', msg: 'Por favor, ingresa tu nombre completo.' };
  return { type: 'success', msg: 'Nombre valido.' };
}

function ValidationMsg({ result }: { result: { type: string; msg: string } | null }) {
  if (!result?.msg) return null;

  // Status styles.
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

export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  validate?: 'email' | 'loginPassword' | 'registerPassword' | 'name' | 'none';
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
  const [touched, setTouched] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const showStrength = validate === 'registerPassword';

  // Field status.
  const result = (() => {
    if (!touched || !value) return null;
    if (validate === 'email') return validateEmail(value);
    if (validate === 'loginPassword') return validateLoginPassword(value);
    if (validate === 'registerPassword') return validateRegisterPassword(value);
    if (validate === 'name') return validateName(value);
    return null;
  })();

  const strength = showStrength && value ? passwordStrength(value) : null;

  const baseInputClass =
    'w-full px-3.5 py-2.5 rounded-lg border text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 text-sm shadow-sm';

  // Border status.
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
          onBlur={() => setTouched(true)}
          style={isPassword ? { paddingRight: '2.75rem' } : {}}
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

      <ValidationMsg result={result} />
    </div>
  );
}

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

export interface FormProps {
  children: ReactNode;
  action: (formData: FormData) => Promise<FormState> | FormState;
  className?: string;
}

type FormState = {
  error?: string;
  success?: string;
};

export function Form({ children, action, className = '' }: FormProps) {
  const [state, formAction] = useActionState(async (_prevState: FormState, formData: FormData) => {
    const result = await action(formData);
    return result ?? {};
  }, {});

  return (
    <form action={formAction} className={`space-y-5 ${className}`}>
      {state.error && <AlertCard type="error" title="No pudimos continuar" msg={state.error} />}
      {state.success && <AlertCard type="success" msg={state.success} />}
      {children}
    </form>
  );
}

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
  const { pending } = useFormStatus();
  const isLoading = loading || pending;
  const baseButtonClass =
    'w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed';

  const variantClass =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.99]';

  return (
    <button
      type={type}
      disabled={isLoading}
      className={`${baseButtonClass} ${variantClass} ${className}`}
    >
      {isLoading ? (
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
