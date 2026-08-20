import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/Button";
import { Download, Upload, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface DataActionsProps {
  onExportExcel?: () => void;
  onExportCsv?: () => void;
  onExportPdf?: () => void;
  onImport?: () => void;
  className?: string;
}

export function DataActions({ onExportExcel, onExportCsv, onExportPdf, onImport, className }: DataActionsProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button variant="outline" onClick={onImport} className="bg-white text-slate-700">
        <Upload className="mr-2 h-4 w-4" />
        Impor
      </Button>
      
      <div className="relative" ref={dropdownRef}>
        <Button variant="outline" onClick={() => setIsExportOpen(!isExportOpen)} className="bg-white text-slate-700">
          <Download className="mr-2 h-4 w-4" />
          Ekspor
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>

        {isExportOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                onClick={() => { onExportExcel?.(); setIsExportOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                Excel (.xlsx)
              </button>
              <button
                onClick={() => { onExportCsv?.(); setIsExportOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center"
              >
                <FileText className="mr-2 h-4 w-4 text-amber-600" />
                CSV (.csv)
              </button>
              <button
                onClick={() => { onExportPdf?.(); setIsExportOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center"
              >
                <FileText className="mr-2 h-4 w-4 text-rose-600" />
                PDF (.pdf)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
