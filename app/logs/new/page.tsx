import LogForm from "@/components/LogForm";
import { createLogAction } from "@/app/actions";
import { listServers, nowForInput } from "@/lib/queries";

export default async function NewLogPage() {
  const [servers, now] = await Promise.all([listServers(), nowForInput()]);
  return (
    <section className="panel">
      <h1>&gt; new maintenance entry</h1>
      <LogForm
        action={createLogAction}
        servers={servers}
        defaultPerformedAt={now}
        submitLabel="insert"
      />
    </section>
  );
}
