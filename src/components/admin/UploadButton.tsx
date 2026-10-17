'use client';

import React, { useRef, useState } from 'react';
import { Loader2, Upload, ImagePlus } from 'lucide-react';

interface Props {
  onFiles: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  label?: string;
  variant?: 'primary' | 'outline' | 'dropzone';
  disabled?: boolean;
  className?: string;
}

/**
 * Botão (ou zona de arrastar) para carregar fotografias/vídeos do computador.
 */
export default function UploadButton({
  onFiles,
  accept = 'image/*',
  multiple = false,
  label = 'CARREGAR DO COMPUTADOR',
  variant = 'primary',
  disabled = false,
  className = '',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [aCarregar, setACarregar] = useState(false);
  const [arrastando, setArrastando] = useState(false);

  const processar = async (lista: FileList | null) => {
    const files = Array.from(lista || []);
    if (files.length === 0) return;
    setACarregar(true);
    try {
      await onFiles(multiple ? files : files.slice(0, 1));
    } finally {
      setACarregar(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      hidden
      onChange={(e) => processar(e.target.files)}
    />
  );

  if (variant === 'dropzone') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => !aCarregar && !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !aCarregar) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          if (!aCarregar && !disabled) processar(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
          arrastando
            ? 'border-mrc-terracotta bg-mrc-blush'
            : 'border-mrc-terracotta/35 bg-mrc-cream hover:border-mrc-terracotta hover:bg-mrc-blush/60'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      >
        {input}
        {aCarregar ? (
          <Loader2 className="w-6 h-6 text-mrc-terracotta animate-spin" />
        ) : (
          <ImagePlus className="w-6 h-6 text-mrc-terracotta" />
        )}
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-mrc-terracotta">
          {aCarregar ? 'A CARREGAR FOTOGRAFIAS…' : label}
        </p>
        {!aCarregar && (
          <p className="text-xs text-mrc-muted">
            Clique ou arraste ficheiros para aqui · JPG, PNG ou WebP
          </p>
        )}
      </div>
    );
  }

  const estilos =
    variant === 'primary'
      ? 'bg-mrc-terracotta hover:bg-mrc-espresso text-white border border-mrc-terracotta'
      : 'bg-white hover:bg-mrc-blush text-mrc-terracotta border border-mrc-terracotta/50';

  return (
    <>
      {input}
      <button
        type="button"
        disabled={aCarregar || disabled}
        onClick={() => inputRef.current?.click()}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors disabled:opacity-60 ${estilos} ${className}`}
      >
        {aCarregar ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Upload className="w-3.5 h-3.5" />
        )}
        {aCarregar ? 'A CARREGAR…' : label}
      </button>
    </>
  );
}
