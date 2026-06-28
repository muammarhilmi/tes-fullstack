import { defineEventHandler, readBody, createError } from "h3"
import bcrypt from "bcrypt"
import pool from "../utils/db"
import { logActivity } from "../utils/activity"
import { sanitizeInput, validatePasswordStrength, validateUsername } from "../utils/sanitize"

export default defineEventHandler(async (event) => {
  const rawBody = await readBody(event)
  const body = sanitizeInput(rawBody)
  const auth = event.context.auth

  // Validasi username
  if (!body.username) {
    throw createError({ statusCode: 400, message: "Username wajib diisi" })
  }
  const usernameCheck = validateUsername(body.username)
  if (!usernameCheck.valid) {
    throw createError({ statusCode: 400, message: usernameCheck.message })
  }

  // Validasi password
  if (!body.password) {
    throw createError({ statusCode: 400, message: "Password wajib diisi" })
  }
  const passwordCheck = validatePasswordStrength(body.password)
  if (!passwordCheck.valid) {
    throw createError({ statusCode: 400, message: passwordCheck.message })
  }

  // Validasi nama pegawai harus dipilih dari autosuggest
  if (!body.id_pegawai) {
    throw createError({ statusCode: 400, message: "Nama Pengguna harus dipilih dari daftar pegawai" })
  }

  // Validasi role
  if (!body.id_role) {
    throw createError({ statusCode: 400, message: "Role wajib dipilih" })
  }

  // Validasi jabatan & departemen
  if (!body.id_jabatan) {
    throw createError({ statusCode: 400, message: "Jabatan wajib dipilih" })
  }
  if (!body.id_departemen) {
    throw createError({ statusCode: 400, message: "Departemen wajib dipilih" })
  }

  // Cek username unik
  const [existingUser] = await pool.query("SELECT id FROM user WHERE username = ?", [body.username])
  if ((existingUser as any[]).length > 0) {
    throw createError({ statusCode: 409, message: "Username sudah digunakan" })
  }

  const passwordHash = await bcrypt.hash(body.password, 10)

  try {
    const [result] = await pool.execute(
      `INSERT INTO user (id_role, id_pegawai, username, password_hash, nama, email, disabled)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        body.id_role || null,
        body.id_pegawai || null,
        body.username,
        passwordHash,
        body.nama || null,
        body.email || null,
        body.disabled ? 1 : 0,
      ],
    )

    if (body.id_pegawai && (body.id_jabatan || body.id_departemen)) {
      await pool.execute(
        "UPDATE pegawai SET id_jabatan = ?, id_departemen = ? WHERE id = ?",
        [body.id_jabatan || null, body.id_departemen || null, body.id_pegawai]
      )
    }

    await logActivity(event, "Tambah User", `Menambahkan user ${body.username}`, auth?.id)

    return { success: true, message: "User berhasil ditambahkan", data: { id: (result as any).insertId } }
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      throw createError({ statusCode: 409, message: "Username sudah digunakan" })
    }
    throw err
  }
})
