/**
 * Utility sanitasi input untuk mencegah XSS
 * Digunakan di semua handler POST/PUT
 */

/**
 * Escape karakter HTML berbahaya
 */
export function escapeHtml(str: string): string {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitasi object secara rekursif
 * Menghapus tag HTML dan karakter berbahaya dari semua value string
 */
export function sanitizeInput(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    // Hapus tag HTML
    return obj.replace(/<[^>]*>/g, "").trim();
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeInput(item));
  }
  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeInput(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

/**
 * Validasi format email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validasi format nomor HP internasional
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{6,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Validasi kekuatan password sesuai requirement soal:
 * - Minimal 8 karakter
 * - Tidak boleh ada spasi
 * - Minimal 1 huruf besar
 * - Minimal 1 huruf kecil
 * - Minimal 1 karakter khusus
 */
export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) return { valid: false, message: "Password minimal 8 karakter" };
  if (/\s/.test(password)) return { valid: false, message: "Password tidak boleh mengandung spasi" };
  if (!/[A-Z]/.test(password)) return { valid: false, message: "Password harus memiliki minimal 1 huruf besar" };
  if (!/[a-z]/.test(password)) return { valid: false, message: "Password harus memiliki minimal 1 huruf kecil" };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    return { valid: false, message: "Password harus memiliki minimal 1 karakter khusus" };
  return { valid: true, message: "OK" };
}

/**
 * Validasi username sesuai requirement soal:
 * - Minimal 6 karakter
 * - Tidak boleh ada spasi
 * - Hanya huruf kecil dan angka
 */
export function validateUsername(username: string): { valid: boolean; message: string } {
  if (username.length < 6) return { valid: false, message: "Username minimal 6 karakter" };
  if (/\s/.test(username)) return { valid: false, message: "Username tidak boleh mengandung spasi" };
  if (!/^[a-zA-Z0-9]+$/.test(username))
    return { valid: false, message: "Username hanya boleh huruf dan angka" };
  return { valid: true, message: "OK" };
}
