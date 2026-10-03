import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useRoom } from '../context/RoomContext';

const icons = {
  success: <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />,
  error: <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />,
};

const bgs = {
  success: 'border-green-500/20 bg-green-900/20',
  error: 'border-red-500/20 bg-red-900/20',
  info: 'border-blue-500/20 bg-blue-900/20',
  warning: 'border-yellow-500/20 bg-yellow-900/20',
};

export function ToastContainer() {
  const { toasts, removeToast } = useRoom();
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[320px] w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl animate-fade-in pointer-events-auto shadow-xl ${bgs[t.type]}`}>
          {icons[t.type]}
          <p className="text-sm text-white flex-1 leading-snug">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="text-gray-500 hover:text-white shrink-0 mt-0.5 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  );
}
