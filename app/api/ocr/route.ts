import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";
import { randomUUID } from "crypto";

/**
 * POST /api/ocr
 * Receives a FormData with an "image" field,
 * saves to a temp file, runs PaddleOCR via Python, returns extracted text.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, text: "Tidak ada file yang dikirim." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/bmp",
      "image/tiff",
      "application/pdf"
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, text: "Format file tidak didukung." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, text: "Ukuran file terlalu besar (maks 10MB)." },
        { status: 400 }
      );
    }

    // Ensure tmp directory exists
    const tmpDir = join(process.cwd(), "tmp");
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    // Write uploaded file to temp location
    const ext = file.name.split(".").pop() || "png";
    const tempFilename = `${randomUUID()}.${ext}`;
    const tempPath = join(tmpDir, tempFilename);

    const bytes = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(bytes));

    // Run Python OCR script
    const ocrResult = await runOcr(tempPath);

    // Clean up temp file
    try {
      await unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }

    return NextResponse.json({
      success: true,
      text: ocrResult,
    });
  } catch (error) {
    console.error("OCR API Error:", error);
    return NextResponse.json(
      {
        success: false,
        text: "Terjadi kesalahan saat memproses file. Pastikan PaddleOCR sudah terinstal.",
      },
      { status: 500 }
    );
  }
}

/**
 * Resolves the Python executable path.
 * Prefers the project's venv Python if it exists, otherwise falls back to system 'python'.
 */
function getPythonPath(): string {
  const isWindows = process.platform === "win32";
  const venvPython = isWindows
    ? join(process.cwd(), "venv", "Scripts", "python.exe")
    : join(process.cwd(), "venv", "bin", "python");

  if (existsSync(venvPython)) {
    return venvPython;
  }
  return "python";
}

/**
 * Spawns a Python process to run ocr.py with the given image path.
 * Uses the venv Python executable where PaddleOCR is installed.
 */
function runOcr(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = join(process.cwd(), "scripts", "ocr.py");
    const pythonPath = getPythonPath();

    console.log(`[OCR] Using Python: ${pythonPath}`);
    console.log(`[OCR] Script: ${scriptPath}`);
    console.log(`[OCR] Image: ${imagePath}`);

    const proc = spawn(pythonPath, [scriptPath, imagePath], {
      cwd: process.cwd(),
      env: { 
        ...process.env, 
        PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK: "True",
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1"
      },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (stderr) {
        console.warn(`[OCR] stderr: ${stderr}`);
      }

      if (code !== 0) {
        console.error(`[OCR] Process exited with code ${code}`);
        
        let errorMessage = "Unknown error";
        try {
          const result = JSON.parse(stdout.trim());
          if (result.error) {
            errorMessage = result.error;
          } else {
            errorMessage = stderr || stdout || "Unknown error";
          }
        } catch (e) {
          errorMessage = stderr || stdout || "Unknown error";
        }

        reject(new Error(`OCR process failed (exit code ${code}): ${errorMessage}`));
        return;
      }

      try {
        const result = JSON.parse(stdout.trim());
        if (result.success) {
          resolve(result.text);
        } else {
          reject(new Error(result.error || "OCR gagal tanpa pesan error"));
        }
      } catch {
        reject(new Error(`Gagal parsing output OCR: ${stdout}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Gagal menjalankan Python: ${err.message}`));
    });
  });
}
