/**
 * Footer — Simple credit footer
 */
export function Footer() {
  return (
    <footer className="w-full py-6 text-center text-xs text-muted/60 border-t border-border-custom mt-auto">
      <p>
        Dibuat dengan{" "}
        <span className="text-gradient font-semibold">Next.js</span> &{" "}
        <span className="text-gradient font-semibold">PaddleOCR</span>
        {" — "}
        <span className="text-foreground/40">
          © {new Date().getFullYear()} OCR Document Scanner
        </span>
      </p>
    </footer>
  );
}
