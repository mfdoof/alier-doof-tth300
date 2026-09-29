"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/actions";
import type { Server } from "@/lib/queries";

export default function ServerForm({
  action,
  server,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  server?: Server;
  submitLabel: string;
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="form-grid">
      <label>
        <span>hostname</span>
        <input name="hostname" defaultValue={server?.hostname} required maxLength={255} />
      </label>
      <label>
        <span>ip_address</span>
        <input name="ip_address" defaultValue={server?.ip_address} required placeholder="10.0.0.1" />
      </label>
      <label>
        <span>role</span>
        <input name="role" defaultValue={server?.role} required maxLength={100} placeholder="web" />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "saving..." : submitLabel}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className="btn">
            cancel
          </Link>
        )}
      </div>
      {state.error && <p className="error">! {state.error}</p>}
    </form>
  );
}
