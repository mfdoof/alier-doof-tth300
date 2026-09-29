import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const servers = [
  ["web-01", "10.0.1.11", "web"],
  ["web-02", "10.0.1.12", "web"],
  ["db-primary", "10.0.2.10", "database"],
  ["cache-01", "10.0.3.20", "cache"],
];

// [hostname, task_type, description, performed_by, outcome, downtime_minutes, days_ago]
const logs = [
  ["web-01", "patch", "Applied kernel security patches", "alice", "success", 12, 2],
  ["web-02", "reboot", "Scheduled reboot after patching", "alice", "success", 5, 2],
  ["db-primary", "backup", "Full backup verification run", "bob", "partial", 0, 4],
  ["db-primary", "hardware", "Replaced failed disk in RAID array", "carol", "success", 45, 9],
  ["cache-01", "config", "Raised maxmemory to 8GB", "bob", "failed", 20, 1],
  ["web-01", "security", "Rotated TLS certificates", "carol", "success", 0, 40],
];

try {
  await conn.beginTransaction();
  for (const [hostname, ip, role] of servers) {
    await conn.query(`INSERT IGNORE INTO servers (hostname, ip_address, role) VALUES (?, ?, ?)`, [
      hostname,
      ip,
      role,
    ]);
  }
  for (const [hostname, taskType, desc, by, outcome, downtime, daysAgo] of logs) {
    await conn.query(
      `INSERT INTO maintenance_logs
         (server_id, task_type, description, performed_by, outcome, downtime_minutes, performed_at)
       SELECT id, ?, ?, ?, ?, ?, NOW() - INTERVAL ? DAY
       FROM servers WHERE hostname = ?`,
      [taskType, desc, by, outcome, downtime, daysAgo, hostname],
    );
  }
  await conn.commit();
  console.log("Seed data inserted.");
} catch (err) {
  await conn.rollback();
  throw err;
} finally {
  await conn.end();
}
