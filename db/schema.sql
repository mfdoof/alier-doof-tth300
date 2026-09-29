CREATE TABLE IF NOT EXISTS servers (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  hostname    VARCHAR(255) NOT NULL UNIQUE,
  ip_address  VARCHAR(45)  NOT NULL, -- validated as IPv4/IPv6 by the app
  role        VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id                INT          AUTO_INCREMENT PRIMARY KEY,
  server_id         INT          NOT NULL,
  task_type         ENUM('patch','reboot','backup','hardware','config','security','monitoring','other') NOT NULL,
  description       TEXT         NOT NULL,
  performed_by      VARCHAR(100) NOT NULL,
  outcome           ENUM('success','partial','failed') NOT NULL,
  downtime_minutes  INT          NOT NULL DEFAULT 0 CHECK (downtime_minutes >= 0),
  performed_at      DATETIME     NOT NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_logs_performed_at (performed_at),
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);
