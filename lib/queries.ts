import { query } from "./db";

export type Server = {
  id: number;
  hostname: string;
  ip_address: string;
  role: string;
};

export type ServerWithCount = Server & { log_count: number };

export type LogRow = {
  id: number;
  server_id: number;
  hostname: string;
  task_type: string;
  description: string;
  performed_by: string;
  outcome: string;
  downtime_minutes: number;
  performed_at: string; // display string
  performed_at_input: string; // YYYY-MM-DDTHH:MM for <input type="datetime-local">
};

export type LogFilters = {
  serverId?: number;
  taskType?: string;
  outcome?: string;
};

export type MonthSummary = {
  month: string;
  total_entries: number;
  total_downtime: number;
  failed_count: number;
};

// ---------- servers ----------

export async function listServers(): Promise<ServerWithCount[]> {
  return query<ServerWithCount>(
    `SELECT s.id, s.hostname, s.ip_address, s.role, COUNT(l.id) AS log_count
       FROM servers s
       LEFT JOIN maintenance_logs l ON l.server_id = s.id
      GROUP BY s.id
      ORDER BY s.hostname`,
  );
}

export async function getServer(id: number): Promise<Server | null> {
  const rows = await query<Server>(
    `SELECT id, hostname, ip_address, role FROM servers WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createServer(s: Omit<Server, "id">): Promise<void> {
  await query(`INSERT INTO servers (hostname, ip_address, role) VALUES (?, ?, ?)`, [
    s.hostname,
    s.ip_address,
    s.role,
  ]);
}

export async function updateServer(id: number, s: Omit<Server, "id">): Promise<void> {
  await query(`UPDATE servers SET hostname = ?, ip_address = ?, role = ? WHERE id = ?`, [
    s.hostname,
    s.ip_address,
    s.role,
    id,
  ]);
}

export async function deleteServer(id: number): Promise<void> {
  await query(`DELETE FROM servers WHERE id = ?`, [id]);
}

// ---------- maintenance logs ----------

const LOG_SELECT = `
  SELECT l.id, l.server_id, s.hostname, l.task_type, l.description,
         l.performed_by, l.outcome, l.downtime_minutes,
         DATE_FORMAT(l.performed_at, '%Y-%m-%d %H:%i')   AS performed_at,
         DATE_FORMAT(l.performed_at, '%Y-%m-%dT%H:%i')   AS performed_at_input
    FROM maintenance_logs l
    JOIN servers s ON s.id = l.server_id`;

export async function listLogs(filters: LogFilters): Promise<LogRow[]> {
  const serverId = filters.serverId ?? null;
  const taskType = filters.taskType ?? null;
  const outcome = filters.outcome ?? null;
  return query<LogRow>(
    `${LOG_SELECT}
      WHERE (? IS NULL OR l.server_id = ?)
        AND (? IS NULL OR l.task_type = ?)
        AND (? IS NULL OR l.outcome   = ?)
      ORDER BY l.performed_at DESC, l.id DESC`,
    [serverId, serverId, taskType, taskType, outcome, outcome],
  );
}

export async function getLog(id: number): Promise<LogRow | null> {
  const rows = await query<LogRow>(`${LOG_SELECT} WHERE l.id = ?`, [id]);
  return rows[0] ?? null;
}

export type LogInput = {
  server_id: number;
  task_type: string;
  description: string;
  performed_by: string;
  outcome: string;
  downtime_minutes: number;
  performed_at: string; // YYYY-MM-DDTHH:MM from <input type="datetime-local">
};

export async function createLog(l: LogInput): Promise<void> {
  await query(
    `INSERT INTO maintenance_logs
       (server_id, task_type, description, performed_by, outcome, downtime_minutes, performed_at)
     VALUES (?, ?, ?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%dT%H:%i'))`,
    [l.server_id, l.task_type, l.description, l.performed_by, l.outcome, l.downtime_minutes, l.performed_at],
  );
}

export async function updateLog(id: number, l: LogInput): Promise<void> {
  await query(
    `UPDATE maintenance_logs
        SET server_id = ?, task_type = ?, description = ?, performed_by = ?,
            outcome = ?, downtime_minutes = ?, performed_at = STR_TO_DATE(?, '%Y-%m-%dT%H:%i')
      WHERE id = ?`,
    [l.server_id, l.task_type, l.description, l.performed_by, l.outcome, l.downtime_minutes, l.performed_at, id],
  );
}

export async function deleteLog(id: number): Promise<void> {
  await query(`DELETE FROM maintenance_logs WHERE id = ?`, [id]);
}

// ---------- summary ----------

export async function getMonthSummary(): Promise<MonthSummary> {
  // No GROUP BY, so this always returns exactly one row (zeros when the month is empty).
  const rows = await query<MonthSummary>(
    `SELECT DATE_FORMAT(NOW(), '%Y-%m')           AS month,
            COUNT(*)                              AS total_entries,
            COALESCE(SUM(downtime_minutes), 0)    AS total_downtime,
            COALESCE(SUM(outcome = 'failed'), 0)  AS failed_count
       FROM maintenance_logs
      WHERE performed_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
        AND performed_at <  DATE_FORMAT(NOW(), '%Y-%m-01') + INTERVAL 1 MONTH`,
  );
  return rows[0];
}

// Current time formatted for <input type="datetime-local">, using the database clock
// so new entries line up with the monthly summary.
export async function nowForInput(): Promise<string> {
  const rows = await query<{ now: string }>(`SELECT DATE_FORMAT(NOW(), '%Y-%m-%dT%H:%i') AS now`);
  return rows[0].now;
}
