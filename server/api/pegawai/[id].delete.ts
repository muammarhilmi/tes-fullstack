import { defineEventHandler, getRouterParam, createError } from "h3"
import pool from "../../utils/db"
import { logActivity } from "../../utils/activity"

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  const auth = event.context.auth

  const [existing] = await pool.query("SELECT nama_pegawai FROM pegawai WHERE id = ?", [id])
  const rows = existing as any[]
  if (rows.length === 0) {
    throw createError({ statusCode: 404, message: "Pegawai tidak ditemukan" })
  }

  // Cek apakah pegawai ini adalah superadmin
  const [superadminCheck] = await pool.query(
    "SELECT u.id FROM user u JOIN user_role r ON u.id_role = r.id WHERE u.id_pegawai = ? AND r.nama_role = 'Superadmin'",
    [id]
  )
  if ((superadminCheck as any[]).length > 0) {
    throw createError({ statusCode: 403, message: "Tidak dapat menghapus data pegawai yang memiliki role Superadmin" })
  }

  await pool.query("DELETE FROM pegawai WHERE id = ?", [id])
  await logActivity(event, "Hapus Pegawai", `Menghapus pegawai ${rows[0].nama_pegawai}`, auth?.id)

  return { success: true, message: "Pegawai berhasil dihapus" }
})
