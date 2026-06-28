import mysql from "mysql2/promise";
(async () => {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'kepegawaian_db'
  });
  const [roles] = await conn.query('SELECT id, nama_role FROM user_role');
  const roleMap = {};
  for(const r of roles) roleMap[r.nama_role] = r.id;
  const sa = roleMap['Superadmin'];
  const mgr = roleMap['Manager HRD'];
  const adm = roleMap['Admin HRD'];
  const permissions = [
    [sa,'dashboard',1,0,'All','No','No'],
    [sa,'kelola_role',1,0,'All','No','No'],
    [sa,'kelola_user',1,1,'All','All','All'],
    [sa,'my_profile',1,0,'Own','Own','No'],
    [sa,'modul_pegawai',0,0,'No','No','No'],
    [sa,'modul_tunjangan_transport',0,0,'No','No','No'],
    [sa,'setting_tunjangan_transport',0,0,'No','No','No'],
    [sa,'modul_log',1,0,'All','No','No'],
    [mgr,'dashboard',1,0,'All','No','No'],
    [mgr,'kelola_role',0,0,'No','No','No'],
    [mgr,'kelola_user',0,0,'No','No','No'],
    [mgr,'my_profile',1,0,'Own','Own','No'],
    [mgr,'modul_pegawai',1,0,'All','No','No'],
    [mgr,'modul_tunjangan_transport',1,0,'Own','No','No'],
    [mgr,'setting_tunjangan_transport',0,0,'No','No','No'],
    [mgr,'modul_log',0,0,'No','No','No'],
    [adm,'dashboard',1,0,'All','No','No'],
    [adm,'kelola_role',0,0,'No','No','No'],
    [adm,'kelola_user',0,0,'No','No','No'],
    [adm,'my_profile',1,0,'Own','Own','No'],
    [adm,'modul_pegawai',1,1,'All','All','All'],
    [adm,'modul_tunjangan_transport',1,0,'Own','No','No'],
    [adm,'setting_tunjangan_transport',1,1,'All','All','All'],
    [adm,'modul_log',0,0,'No','No','No']
  ];
  for(const p of permissions) {
    await conn.query('INSERT INTO role_permission (id_role, modul_fitur, akses, `create`, `read`, `update`, `delete`) VALUES (?,?,?,?,?,?,?)', p);
  }
  console.log('Seeder success');
  await conn.end();
})();
