import { notFound } from "next/navigation";
import ServerForm from "@/components/ServerForm";
import { updateServerAction } from "@/app/actions";
import { getServer } from "@/lib/queries";

export default async function EditServerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId)) notFound();
  const id = Number(rawId);

  const server = await getServer(id);
  if (!server) notFound();

  return (
    <section className="panel">
      <h1>&gt; edit server #{server.id}</h1>
      <ServerForm
        action={updateServerAction.bind(null, id)}
        server={server}
        submitLabel="update"
        cancelHref="/servers"
      />
    </section>
  );
}
