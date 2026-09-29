import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import { OUTCOMES, TASK_TYPES } from "@/lib/constants";
import { getMonthSummary, listLogs, listServers } from "@/lib/queries";
import { deleteLogAction } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const serverParam = one(sp.server);
  const taskType = one(sp.task_type);
  const outcome = one(sp.outcome);

  const serverId = /^\d+$/.test(serverParam) ? Number(serverParam) : undefined;

  const [summary, servers, logs] = await Promise.all([
    getMonthSummary(),
    listServers(),
    listLogs({
      serverId,
      taskType: TASK_TYPES.includes(taskType) ? taskType : undefined,
      outcome: OUTCOMES.includes(outcome) ? outcome : undefined,
    }),
  ]);

  const filtered = Boolean(serverId || taskType || outcome);

  return (
    <>
      <section className="summary">
        <div className="summary-title">&gt; this_month [{summary.month}]</div>
        <div className="stats">
          <div className="stat">
            <span className="stat-label">entries</span>
            <span className="stat-value">{summary.total_entries}</span>
          </div>
          <div className="stat">
            <span className="stat-label">downtime_min</span>
            <span className={`stat-value ${summary.total_downtime > 0 ? "amber" : "green"}`}>
              {summary.total_downtime}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">failed_tasks</span>
            <span className={`stat-value ${summary.failed_count > 0 ? "red" : "green"}`}>
              {summary.failed_count}
            </span>
          </div>
        </div>
      </section>

      <form className="filters" method="get">
        <span className="muted">filter:</span>
        <select name="server" defaultValue={serverParam}>
          <option value="">all servers</option>
          {servers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.hostname}
            </option>
          ))}
        </select>
        <select name="task_type" defaultValue={taskType}>
          <option value="">all task types</option>
          {TASK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="outcome" defaultValue={outcome}>
          <option value="">all outcomes</option>
          {OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary btn-sm">
          apply
        </button>
        {filtered && (
          <Link href="/" className="btn btn-sm">
            reset
          </Link>
        )}
        <span className="muted count">
          {logs.length} row{logs.length === 1 ? "" : "s"}
        </span>
      </form>

      {logs.length === 0 ? (
        <p className="muted empty">
          {filtered ? "-- no entries match these filters --" : "-- no maintenance logged yet --"}
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>performed_at</th>
                <th>host</th>
                <th>task</th>
                <th>outcome</th>
                <th className="num">down</th>
                <th>by</th>
                <th>description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="nowrap">{l.performed_at}</td>
                  <td className="nowrap accent">{l.hostname}</td>
                  <td>{l.task_type}</td>
                  <td>
                    <span className={`badge badge-${l.outcome}`}>{l.outcome}</span>
                  </td>
                  <td className="num">{l.downtime_minutes}m</td>
                  <td>{l.performed_by}</td>
                  <td className="desc">{l.description}</td>
                  <td className="nowrap actions">
                    <Link href={`/logs/${l.id}/edit`} className="btn btn-sm">
                      edit
                    </Link>
                    <DeleteButton
                      action={deleteLogAction.bind(null, l.id)}
                      confirmText={`Delete log #${l.id} for ${l.hostname}?`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
