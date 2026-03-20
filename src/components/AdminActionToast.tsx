import { CheckCircle2, XCircle } from 'lucide-react';

interface AdminActionToastProps {
  type: 'success' | 'error' | '';
  text: string;
}

export function AdminActionToast({ type, text }: AdminActionToastProps) {
  if (!type || !text) {
    return null;
  }

  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120] sm:right-6 sm:top-6">
      <div
        className={`pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl animate-in fade-in slide-in-from-top-3 ${
          isSuccess
            ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-100'
            : 'border-red-400/35 bg-red-500/15 text-red-100'
        }`}
      >
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isSuccess ? 'text-emerald-300' : 'text-red-300'}`} />
        <div className="min-w-0">
          <div className="text-sm font-semibold">{isSuccess ? 'Success' : 'Error'}</div>
          <div className="mt-0.5 text-sm leading-6 text-white/90">{text}</div>
        </div>
      </div>
    </div>
  );
}
