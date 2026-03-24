"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { Sparkles, ScanLine } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { ResultDisplay } from "@/components/ResultDisplay";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

type AppState = "idle" | "loading" | "result" | "error";

interface OcrResult {
  text: string;
  success: boolean;
}

export default function HomePage() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<OcrResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleFileSelect = useCallback(async (file: File) => {
    // Create preview URL
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setState("loading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const data: OcrResult = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.text || "Gagal memproses gambar");
      }

      setResult(data);
      setState("result");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga");
      setState("error");
    }
  }, []);

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setImageUrl(null);
    setErrorMsg("");
  };

  return (
    <>
      <ThemeToggle />

      <main className="flex-1 flex flex-col animated-gradient-bg">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
          {/* Header — only visible in idle/loading state */}
          <AnimatePresence>
            {(state === "idle" || state === "loading") && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12 max-w-3xl"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 text-xs font-medium text-teal"
                >
                  <Sparkles size={13} />
                  AI-Powered Document Scanner
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5"
                >
                  Scan Tulisan Tangan &{" "}
                  <br className="hidden sm:block" />
                  Dokumen Anda{" "}
                  <span className="text-gradient">Secara Instan</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  className="text-muted text-base sm:text-lg max-w-lg mx-auto"
                >
                  Powered by AI OCR — Gratis & Privat.{" "}
                  <span className="hidden sm:inline">
                    Upload gambar dokumen, catatan, atau screenshot dan dapatkan teksnya dalam hitungan detik.
                  </span>
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content area — switches between upload, loading, result, error */}
          <div className="w-full max-w-5xl mx-auto px-4">
            <AnimatePresence mode="wait">
              {state === "idle" && (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Dropzone onFileSelect={handleFileSelect} />

                  {/* Feature badges */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap justify-center gap-3 mt-8"
                  >
                    {["Tulisan Tangan", "Dokumen Cetak", "Screenshot", "Multi-Bahasa"].map(
                      (feature, i) => (
                        <span
                          key={feature}
                          className="glass rounded-full px-3 py-1 text-xs text-muted/80 font-medium"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          <ScanLine size={11} className="inline mr-1.5 text-teal/60" />
                          {feature}
                        </span>
                      )
                    )}
                  </motion.div>
                </motion.div>
              )}

              {state === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingSpinner />
                </motion.div>
              )}

              {state === "result" && result && imageUrl && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <ResultDisplay
                    imageUrl={imageUrl}
                    text={result.text}
                    onReset={handleReset}
                  />
                </motion.div>
              )}

              {state === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="glass rounded-2xl p-8 max-w-md mx-auto">
                    <div className="text-4xl mb-3">😕</div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      Gagal Memproses
                    </h3>
                    <p className="text-muted text-sm mb-5">{errorMsg}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                      className="glass rounded-xl px-6 py-2.5 text-sm font-medium text-teal 
                                 hover:bg-teal/10 transition-colors cursor-pointer"
                    >
                      Coba Lagi
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
