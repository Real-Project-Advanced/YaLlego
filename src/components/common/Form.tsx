'use client';

import { ReactNode, useActionState, useRef, useState, useEffect } from 'react';

/* ── Validation helpers ────────────────────────── */
function validateEmail(v: string) {
  if (!v) return { type: 'error', msg: 'El correo es requerido.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    return { type: 'error', msg: 'Ingresa un correo válido (ej. tu@email.com).' };
  return { type: 'success', msg: 'Correo válido.' };
}

function validatePassword(v: string) {
  if (!v) return { type: 'error', msg: 'La contraseña es requerida.' };
  if (v.length < 8) return { type: 'error', msg: `Mínimo 8 caracteres (tienes ${v.length}).` };
  if (!/[A-Z]/.test(v))
    return { type: 'warning', msg: 'Recomendado: incluye al menos una mayúscula.' };
  if (!/[0-9]/.test(v)) return { type: 'warning', msg: 'Recomendado: incluye al menos un número.' };
  return { type: 'success', msg: 'Contraseña segura.' };
}

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

function validateName(v: string) {
  if (!v) return { type: 'error', msg: 'El nombre es requerido.' };
  if (v.trim().length < 2) return { type: 'error', msg: 'Ingresa tu nombre completo.' };
  return { type: 'success', msg: '' };
}

/* ── Icons ─────────────────────────────────────── */
const IconCheck = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconWarn = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconEye = ({ open }: { open: boolean }) =>
  open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

/* ── ValidationMsg ─────────────────────────────── */
function ValidationMsg({ result }: { result: { type: string; msg: string } | null }) {
  if (!result?.msg) return null;
  const cfg = {
    error: { cls: 'validation-error', Icon: IconX },
    success: { cls: 'validation-success', Icon: IconCheck },
    warning: { cls: 'validation-warning', Icon: IconWarn },
  }[result.type as 'error' | 'success' | 'warning'] ?? { cls: 'validation-error', Icon: IconX };
  return (
    <div className={`validation-msg ${cfg.cls}`}>
      <cfg.Icon />
      {result.msg}
    </div>
  );
}

/* ── FormField ─────────────────────────────────── */
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
  const [touched, setTouched] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';

  const result = (() => {
    if (!touched || !value) return null;
    if (validate === 'email') return validateEmail(value);
    if (validate === 'password') return validatePassword(value);
    if (validate === 'name') return validateName(value);
    return null;
  })();

  const strength = isPassword && value ? passwordStrength(value) : null;

  const inputClass = [
    'input-field',
    touched && result?.type === 'error' ? 'input-error' : '',
    touched && result?.type === 'success' ? 'input-success' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inputType = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div className="block">
      <label className="text-sm font-bold text-slate-700" htmlFor={name}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={name}
          className={inputClass}
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
            <IconEye open={showPass} />
          </button>
        )}
      </div>
      {strength && value && (
        <div>
          <div className="strength-bar-track">
            <div
              className="strength-bar-fill"
              style={{ width: strength.width, backgroundColor: strength.color }}
            />
          </div>
          {strength.label && (
            <p className="mt-1 text-xs font-semibold" style={{ color: strength.color }}>
              {strength.label}
            </p>
          )}
        </div>
      )}
      <ValidationMsg result={result} />
    </div>
  );
}

/* ── AlertCard ─────────────────────────────────── */
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
    error: { cls: 'alert-error', Icon: IconX, icon_color: '#ef4444' },
    success: { cls: 'alert-success', Icon: IconCheck, icon_color: '#10b981' },
    warning: { cls: 'alert-warning', Icon: IconWarn, icon_color: '#f59e0b' },
    info: { cls: 'alert-info', Icon: IconWarn, icon_color: '#2563eb' },
  }[type];
  return (
    <div className={`alert-card ${cfg.cls}`}>
      <span style={{ color: cfg.icon_color, flexShrink: 0, marginTop: 2 }}>
        <cfg.Icon />
      </span>
      <div>
        {title && <p className="font-bold text-sm">{title}</p>}
        <p className="text-sm">{msg}</p>
      </div>
    </div>
  );
}

/* ── Form ──────────────────────────────────────── */
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

/* ── FormButton ────────────────────────────────── */
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
  return (
    <button type={type} disabled={loading} className={`btn btn-${variant} ${className}`}>
      {loading ? (
        <>
          <span className="spinner" />
          <span>Procesando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
