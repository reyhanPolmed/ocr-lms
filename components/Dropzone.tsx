"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useCallback, useState, useRef, type DragEvent } from "react";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/bmp", "image/tiff", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Dropzone — Premium drag-and-drop file upload area with glow borders
 */
export function Dropzone({ onFileSelect, disabled = false }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Format tidak didukung. Gunakan PDF, PNG, JPG, WebP, BMP, atau TIFF.");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError("Ukuran file terlalu besar (maks 10MB).");
        return;
      }

      const url = URL.createObjectURL(file);
      setPreview(url);
      setFileName(file.name);
      setFileType(file.type);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) validateAndSet(file);
    },
    [validateAndSet, disabled]
  );

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const clearPreview = () => {
    setPreview(null);
    setFileName(null);
    setFileType(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={handleClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-10 cursor-pointer",
          "flex flex-col items-center justify-center gap-4 min-h-[260px]",
          "transition-all duration-300",
          isDragging
            ? "animate-border-glow bg-teal/5 scale-[1.02]"
            : "border-border-custom hover:border-teal/40 hover:bg-surface",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-500/50"
        )}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validateAndSet(file);
          }}
          disabled={disabled}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative">
                {fileType === "application/pdf" ? (
                  <div className="flex items-center justify-center w-[320px] h-[200px] bg-red-500/10 rounded-xl shadow-lg border border-red-500/20">
                    <span className="text-red-500 font-bold text-2xl">PDF</span>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-[320px] max-h-[200px] rounded-xl shadow-lg object-contain"
                  />
                )}
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearPreview();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500/90 hover:bg-red-500 
                               text-white rounded-full p-1 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm text-muted truncate max-w-[300px]">{fileName}</p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Animated upload icon */}
              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <div className="rounded-2xl bg-teal/10 p-5">
                  <Upload size={32} className="text-teal" />
                </div>
                {/* Subtle glow behind icon */}
                <div className="absolute inset-0 rounded-2xl bg-teal/5 blur-xl" />
              </motion.div>

              <div className="text-center">
                <p className="text-foreground/90 font-medium text-base">
                  {isDragging ? "Lepaskan file di sini..." : "Seret & lepas file di sini"}
                </p>
                <p className="text-muted text-sm mt-1">
                  atau <span className="text-teal underline underline-offset-2">klik untuk pilih file</span>
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted/60">
                <ImageIcon size={14} />
                <span>PDF, PNG, JPG, WebP, BMP, TIFF • Maks 10MB</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-3 text-center text-sm text-red-400 font-medium"
          >
            ⚠️ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
