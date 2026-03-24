"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Download, RotateCcw } from "lucide-react";
import { useState } from "react";
import { ButtonGlass } from "./ButtonGlass";
import { CardGlass } from "./CardGlass";

interface ResultDisplayProps {
  imageUrl: string;
  text: string;
  onReset: () => void;
}

/**
 * ResultDisplay — Shows OCR result in a glassmorphic split view:
 *   Left = Image preview
 *   Right = Extracted text with copy/download actions
 */
export function ResultDisplay({ imageUrl, text, onReset }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hasil-ocr.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <CardGlass
        strong
        className="p-0 overflow-hidden"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Image preview */}
          <div className="p-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border-custom bg-surface/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Gambar yang di-scan"
                className="max-w-full max-h-[400px] rounded-xl shadow-lg object-contain"
              />
            </motion.div>
          </div>

          {/* Right: OCR text result */}
          <div className="p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Hasil Ekstraksi Teks
              </h3>
              <div className="flex items-center gap-1 text-xs text-teal font-medium px-2.5 py-1 rounded-full bg-teal/10">
                <Check size={12} />
                Berhasil
              </div>
            </div>

            {/* Text output */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1 mb-4 min-h-[200px] max-h-[350px] overflow-auto"
            >
              <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/85 font-mono bg-surface/60 rounded-lg p-4 border border-border-custom">
                {text || "(Tidak ada teks yang terdeteksi)"}
              </pre>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <ButtonGlass variant="teal" onClick={handleCopy}>
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.5 }}
                      className="flex items-center gap-1.5"
                    >
                      <Check size={15} /> Tersalin!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.5 }}
                      className="flex items-center gap-1.5"
                    >
                      <Copy size={15} /> Salin Teks
                    </motion.span>
                  )}
                </AnimatePresence>
              </ButtonGlass>

              <ButtonGlass variant="purple" onClick={handleDownload}>
                <Download size={15} />
                Download .txt
              </ButtonGlass>

              <ButtonGlass variant="outline" onClick={onReset}>
                <RotateCcw size={15} />
                Scan Ulang
              </ButtonGlass>
            </motion.div>
          </div>
        </div>
      </CardGlass>
    </motion.div>
  );
}
