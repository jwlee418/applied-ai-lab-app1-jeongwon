import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Info,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';

interface CsvUploaderProps {
  onDataParsed: (csvText: string, filename?: string) => void;
  onClose?: () => void;
  currentFilename?: string;
  isModal?: boolean;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  onDataParsed,
  onClose,
  currentFilename,
  isModal = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expectedColumns = [
    { name: 'quarter', desc: 'e.g. Q1, Q2, Q3, Q4' },
    { name: 'region', desc: 'e.g. North America, Europe' },
    { name: 'channel', desc: 'e.g. Direct, Online, Partner' },
    { name: 'product', desc: 'e.g. Cloud Suite, AI Engine' },
    { name: 'units', desc: 'Integer units sold' },
    { name: 'discount_pct', desc: 'e.g. 0.15 or 15%' },
    { name: 'revenue', desc: 'e.g. 150000 or $150,000' },
  ];

  const handleFile = (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setErrorMessage('Please select a valid .csv file.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text || text.trim().length === 0) {
          setErrorMessage('The selected CSV file is empty.');
          setIsProcessing(false);
          return;
        }
        onDataParsed(text, file.name);
        setIsProcessing(false);
        if (onClose) onClose();
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to read CSV file.');
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file.');
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const content = (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Upload Sales Orders CSV
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ensure your CSV has all 7 required columns to compute regional revenue and trigger the AI shift analysis.
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Expected Schema Pills */}
        <div className="mt-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              Required CSV Columns (7)
            </span>
            <span className="text-[11px] text-slate-500">Case-insensitive headers accepted</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {expectedColumns.map((col) => (
              <div
                key={col.name}
                className="bg-white border border-slate-200/90 rounded-lg p-2 text-center shadow-2xs"
              >
                <div className="font-mono text-xs font-bold text-indigo-600">{col.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={col.desc}>
                  {col.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drag and Drop Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-5 border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/40 hover:bg-indigo-50/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            accept=".csv,text/csv"
            className="hidden"
          />

          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-2xs">
            <Upload className="w-6 h-6 animate-pulse" />
          </div>

          <p className="text-sm font-medium text-slate-800">
            {isProcessing ? 'Processing CSV file...' : 'Drop your sales CSV here, or click to browse'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supports .csv files with standard comma delimiter, quotes, and currency symbols
          </p>

          {currentFilename && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Currently loaded: </span>
              <strong className="text-slate-800 font-medium">{currentFilename}</strong>
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Upload failed</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="w-full max-w-3xl">{content}</div>
      </div>
    );
  }

  return content;
};
