import { MapPinned } from 'lucide-react';

type AppLogoProps = {
  subtitle?: string;
  iconClassName?: string;
  textClassName?: string;
};

export function AppLogo({ subtitle, iconClassName, textClassName }: AppLogoProps) {
  return (
    <>
      <span
        className={`grid size-10 place-items-center rounded-lg bg-blue-700 text-white ${iconClassName ?? ''}`}
        aria-hidden="true"
      >
        <MapPinned size={22} strokeWidth={2.5} />
      </span>
      <span className="min-w-0">
        <span
          className={`block text-lg font-black leading-5 text-slate-950 ${textClassName ?? ''}`}
        >
          LlegoYa
        </span>
        {subtitle ? (
          <span className="block text-xs font-bold uppercase text-slate-500">{subtitle}</span>
        ) : null}
      </span>
    </>
  );
}
