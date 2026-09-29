"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/actions";
import { OUTCOMES, TASK_TYPES } from "@/lib/constants";
import type { LogRow, Server } from "@/lib/queries";

export default function LogForm({
  action,
  servers,
  log,
  defaultPerformedAt,
  submitLabel,
}: {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  servers: Server[];
  log?: LogRow;
  defaultPerformedAt?: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  if (servers.length === 0) {
    return (
      <p className="muted">
        No servers yet. <Link href="/servers">Add a server</Link> before logging maintenance.
      </p>
    );
  }

  return (
    <form action={formAction} className="form-grid">
      <label>
        <span>server</span>
        <select name="server_id" defaultValue={log?.server_id ?? ""} required>
          <option value="" disabled>
            -- select --
          </option>
          {servers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.hostname} ({s.ip_address})
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>task_type</span>
        <select name="task_type" defaultValue={log?.task_type ?? ""} required>
          <option value="" disabled>
            -- select --
          </option>
          {TASK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>outcome</span>
        <select name="outcome" defaultValue={log?.outcome ?? "success"} required>
          {OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>performed_by</span>
        <input name="performed_by" defaultValue={log?.performed_by} required maxLength={100} />
      </label>
      <label>
        <span>downtime_minutes</span>
        <input
          name="downtime_minutes"
          type="number"
          min={0}
          step={1}
          defaultValue={log?.downtime_minutes ?? 0}
          required
        />
      </label>
      <label>
        <span>performed_at</span>
        <input
          name="performed_at"
          type="datetime-local"
          defaultValue={log?.performed_at_input ?? defaultPerformedAt}
          required
        />
      </label>
      <label className="full">
        <span>description</span>
        <textarea name="description" rows={4} defaultValue={log?.description} required />
      </label>
      <div className="form-actions full">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "saving..." : submitLabel}
        </button>
        <Link href="/" className="btn">
          cancel
        </Link>
      </div>
      {state.error && <p className="error full">! {state.error}</p>}
    </form>
  );
}
