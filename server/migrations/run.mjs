/**
 * run.mjs - Migration Runner
 * Jalankan dengan: node server/migrations/run.mjs
 */
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

config(); // load .env

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  multipleStatements: true,
});

// Buat database jika belum ada
const dbName = process.env.DB_NAME || "kepegawaian_db";
console.log(`\n📦 Memastikan database '${dbName}' tersedia...`);
await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await conn.query(`USE \`${dbName}\``);
console.log(`✅ Database '${dbName}' siap.`);

// Ambil semua file SQL dan JS/MJS migration, urutkan by nama file
const files = fs
  .readdirSync(__dirname)
  .filter((f) => (f.endsWith(".sql") || f.endsWith(".js") || f.endsWith(".cjs")) && f !== "run.mjs")
  .sort();

for (const file of files) {
  const filePath = path.join(__dirname, file);
  console.log(`\n▶️  Menjalankan: ${file}`);
  try {
    if (file.endsWith(".sql")) {
      const sql = fs.readFileSync(filePath, "utf-8");
      // Jalankan statement per statement, pisahkan berdasarkan ;
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const stmt of statements) {
        try {
          await conn.query(stmt);
        } catch (e) {
          // Abaikan error kolom sudah ada, tabel sudah ada
          if (
            e.code === "ER_DUP_FIELDNAME" ||
            e.code === "ER_TABLE_EXISTS_ERROR" ||
            e.code === "ER_DUP_KEYNAME" ||
            (e.message && e.message.includes("already exists"))
          ) {
            console.log(`   ⚠️  Diabaikan (sudah ada): ${e.message.substring(0, 80)}`);
          } else {
            throw e;
          }
        }
      }
    }
    console.log(`   ✅ Selesai: ${file}`);
  } catch (err) {
    console.error(`   ❌ Error di ${file}:`, err.message);
    process.exit(1);
  }
}

// ============================================================
// SEED DATA - Hanya insert jika tabel masih kosong
// ============================================================
console.log("\n🌱 Menjalankan seed data...");

// Seed: user_role
const [roleRows] = await conn.query("SELECT COUNT(*) as c FROM user_role");
if (roleRows[0].c === 0) {
  await conn.query(`
    INSERT INTO user_role (nama_role) VALUES
    ('Superadmin'),
    ('Manager HRD'),
    ('Admin HRD')
  `);
  console.log("   ✅ Seed: user_role (3 role)");
} else {
  console.log("   ⏭️  Skip seed user_role (sudah ada data)");
}

// Seed: role_permission
const [permRows] = await conn.query("SELECT COUNT(*) as c FROM role_permission");
if (permRows[0].c === 0) {
  // Ambil id role
  const [roles] = await conn.query("SELECT id, nama_role FROM user_role");
  const roleMap = {};
  for (const r of roles) roleMap[r.nama_role] = r.id;

  const sa = roleMap["Superadmin"];
  const mgr = roleMap["Manager HRD"];
  const adm = roleMap["Admin HRD"];

  const permissions = [
    // Superadmin
    [sa, "dashboard", 1, 0, "All", "No", "No"],
    [sa, "kelola_role", 1, 0, "All", "No", "No"],
    [sa, "kelola_user", 1, 1, "All", "All", "All"],
    [sa, "my_profile", 1, 0, "Own", "Own", "No"],
    [sa, "modul_pegawai", 0, 0, "No", "No", "No"],
    [sa, "modul_tunjangan_transport", 0, 0, "No", "No", "No"],
    [sa, "setting_tunjangan_transport", 0, 0, "No", "No", "No"],
    [sa, "modul_log", 1, 0, "All", "No", "No"],
    // Manager HRD
    [mgr, "dashboard", 1, 0, "All", "No", "No"],
    [mgr, "kelola_role", 0, 0, "No", "No", "No"],
    [mgr, "kelola_user", 0, 0, "No", "No", "No"],
    [mgr, "my_profile", 1, 0, "Own", "Own", "No"],
    [mgr, "modul_pegawai", 1, 0, "All", "No", "No"],
    [mgr, "modul_tunjangan_transport", 1, 0, "Own", "No", "No"],
    [mgr, "setting_tunjangan_transport", 0, 0, "No", "No", "No"],
    [mgr, "modul_log", 0, 0, "No", "No", "No"],
    // Admin HRD
    [adm, "dashboard", 1, 0, "All", "No", "No"],
    [adm, "kelola_role", 0, 0, "No", "No", "No"],
    [adm, "kelola_user", 0, 0, "No", "No", "No"],
    [adm, "my_profile", 1, 0, "Own", "Own", "No"],
    [adm, "modul_pegawai", 1, 1, "All", "All", "All"],
    [adm, "modul_tunjangan_transport", 1, 0, "Own", "No", "No"],
    [adm, "setting_tunjangan_transport", 1, 1, "All", "All", "All"],
    [adm, "modul_log", 0, 0, "No", "No", "No"],
  ];

  for (const [id_role, modul_fitur, akses, create_, read_, update_, delete_] of permissions) {
    await conn.query(
      "INSERT INTO role_permission (id_role, modul_fitur, akses, `create`, `read`, `update`, `delete`) VALUES (?,?,?,?,?,?,?)",
      [id_role, modul_fitur, akses, create_, read_, update_, delete_]
    );
  }
  console.log("   ✅ Seed: role_permission (24 permission)");
} else {
  console.log("   ⏭️  Skip seed role_permission (sudah ada data)");
}

// Seed: user superadmin default
const [userRows] = await conn.query("SELECT COUNT(*) as c FROM user WHERE username = 'superadmin'");
if (userRows[0].c === 0) {
  // bcrypt hash dari 'Admin@123'
  const bcrypt = (await import("bcrypt")).default;
  const hash = await bcrypt.hash("Admin@123", 10);
  const [roleRes] = await conn.query("SELECT id FROM user_role WHERE nama_role = 'Superadmin' LIMIT 1");
  const roleId = roleRes[0]?.id || 1;
  await conn.query(
    "INSERT INTO user (id_role, username, password_hash, nama, email, disabled) VALUES (?, 'superadmin', ?, 'Super Admin', 'superadmin@fwd-jmc.com', 0)",
    [roleId, hash]
  );
  console.log("   ✅ Seed: user superadmin (username: superadmin, password: Admin@123)");
} else {
  console.log("   ⏭️  Skip seed user superadmin (sudah ada)");
}

await conn.end();
console.log("\n🎉 Semua migrasi & seed berhasil dijalankan!\n");
