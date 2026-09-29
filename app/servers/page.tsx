import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import ServerForm from "@/components/ServerForm";
import { createServerAction, deleteServerAction } from "@/app/actions";
import { listServers } from "@/lib/queries";

export default async function ServersPage() {
  const servers = await listServers();

  return (
    <>
      <section className="panel">
        <h1>&gt; add server</h1>
        <ServerForm action={createServerAction} submitLabel="insert" />
      </section>

      <section>
        <h2 className="section-title">&gt; servers ({servers.length})</h2>
        {servers.length === 0 ? (
          <p className="muted empty">-- no servers registered --</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>id</th>
                  <th>hostname</th>
                  <th>ip_address</th>
                  <th>role</th>
                  <th className="num">logs</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {servers.map((s) => (
                  <tr key={s.id}>
                    <td className="muted">{s.id}</td>
                    <td className="accent">
                      <Link href={`/?server=${s.id}`}>{s.hostname}</Link>
                    </td>
                    <td>{s.ip_address}</td>
                    <td>{s.role}</td>
                    <td className="num">{s.log_count}</td>
                    <td className="nowrap actions">
                      <Link href={`/servers/${s.id}/edit`} className="btn btn-sm">
                        edit
                      </Link>
                      <DeleteButton
                        action={deleteServerAction.bind(null, s.id)}
                        confirmText={`Delete ${s.hostname}? This also deletes its ${s.log_count} log entr${s.log_count === 1 ? "y" : "ies"}.`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
