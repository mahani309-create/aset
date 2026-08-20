import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
}

export function FormModal({ isOpen, onClose, title, children, onSubmit, submitText = "Simpan Data" }: FormModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 shrink-0">
          <h3 className="font-semibold text-lg text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <form id="generic-form" onSubmit={onSubmit} className="space-y-4">
            {children}
          </form>
        </div>
        <div className="px-6 py-4 border-t border-slate-300 bg-slate-50 flex justify-end gap-3 shrink-0">
          <Button type="button" variant="outline" className="bg-white text-slate-700" onClick={onClose}>Batal</Button>
          <Button type="submit" form="generic-form">{submitText}</Button>
        </div>
      </div>
    </div>
  );
}
