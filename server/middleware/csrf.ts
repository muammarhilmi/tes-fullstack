/**
 * CSRF Protection Middleware
 * Memvalidasi header X-Requested-With untuk semua request mutasi (POST/PUT/DELETE)
 * Frontend harus mengirimkan header 'X-Requested-With: XMLHttpRequest'
 */
import { defineEventHandler, getHeader, createError } from "h3";

export default defineEventHandler((event) => {
  const url = event.node.req.url || "";
  const method = event.method;

  // Hanya berlaku untuk API endpoint dengan method mutasi
  if (!url.startsWith("/api")) return;
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return;

  // Skip login dan public routes
  if (url.includes("/auth/login") || url.includes("/auth/logout")) return;

  // Periksa header X-Requested-With
  const xRequestedWith = getHeader(event, "x-requested-with");
  if (xRequestedWith !== "XMLHttpRequest") {
    throw createError({
      statusCode: 403,
      message: "CSRF validation failed. Pastikan request berasal dari aplikasi.",
    });
  }
});
