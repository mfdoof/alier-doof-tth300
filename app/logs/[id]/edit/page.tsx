import { notFound } from "next/navigation";
import LogForm from "@/components/LogForm";
import { updateLogAction } from "@/app/actions";
import { getLog, listServers } from "@/lib/queries";

export default async function EditLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId)) notFound();
  const id = Number(rawId);

  const [log, servers] = await Promise.all([getLog(id), listServers()]);
  if (!log) notFound();

  return (
    <section className="panel">
      <h1>&gt; edit log #{log.id}</h1>
      <LogForm
        action={updateLogAction.bind(null, id)}
        servers={servers}
        log={log}
        submitLabel="update"
      />
    </section>
  );
}
