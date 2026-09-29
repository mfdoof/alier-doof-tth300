"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isIP } from "node:net";
import { OUTCOMES, TASK_TYPES } from "@/lib/constants";
import * as q from "@/lib/queries";

export type FormState = { error?: string };

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

function dbErrorMessage(err: unknown): string {
  switch ((err as { code?: string }).code) {
    case "ER_DUP_ENTRY":
      return "A server with that hostname already exists.";
    case "ER_NO_REFERENCED_ROW_2":
      return "Selected server no longer exists.";
    case "ER_BAD_NULL_ERROR":
    case "ER_TRUNCATED_WRONG_VALUE":
    case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
      return "Invalid date/time value.";
    case "ER_CHECK_CONSTRAINT_VIOLATED":
      return "A value failed a database check constraint.";
    default:
      console.error(err);
      return "Database error. See server logs for details.";
  }
}

// Run a validated write, then refresh and redirect. Returns an error for the form on failure.
async function save<T>(
  parsed: { error: string } | { data: T },
  write: (data: T) => Promise<void>,
  redirectTo: string,
): Promise<FormState> {
  if ("error" in parsed) return parsed;
  try {
    await write(parsed.data);
  } catch (err) {
    return { error: dbErrorMessage(err) };
  }
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

// ---------- servers ----------

function parseServer(fd: FormData): { error: string } | { data: Omit<q.Server, "id"> } {
  const data = {
    hostname: str(fd, "hostname"),
    ip_address: str(fd, "ip_address"),
    role: str(fd, "role"),
  };
  if (!data.hostname || !data.ip_address || !data.role) {
    return { error: "Hostname, IP address and role are all required." };
  }
  if (!isIP(data.ip_address)) return { error: "Invalid IP address." };
  return { data };
}

export async function createServerAction(_: FormState, fd: FormData): Promise<FormState> {
  return save(parseServer(fd), q.createServer, "/servers");
}

export async function updateServerAction(id: number, _: FormState, fd: FormData): Promise<FormState> {
  return save(parseServer(fd), (data) => q.updateServer(id, data), "/servers");
}

export async function deleteServerAction(id: number): Promise<void> {
  await q.deleteServer(id);
  revalidatePath("/", "layout");
  redirect("/servers");
}

// ---------- maintenance logs ----------

function parseLog(fd: FormData): { error: string } | { data: q.LogInput } {
  const data: q.LogInput = {
    server_id: Number(str(fd, "server_id")),
    task_type: str(fd, "task_type"),
    description: str(fd, "description"),
    performed_by: str(fd, "performed_by"),
    outcome: str(fd, "outcome"),
    downtime_minutes: Number(str(fd, "downtime_minutes") || "0"),
    performed_at: str(fd, "performed_at"),
  };

  if (!Number.isInteger(data.server_id) || data.server_id <= 0) return { error: "Select a server." };
  if (!TASK_TYPES.includes(data.task_type)) return { error: "Select a valid task type." };
  if (!OUTCOMES.includes(data.outcome)) return { error: "Select a valid outcome." };
  if (!data.description || !data.performed_by)
    return { error: "Description and performed-by are required." };
  if (!Number.isInteger(data.downtime_minutes) || data.downtime_minutes < 0)
    return { error: "Downtime must be a whole number of minutes (0 or more)." };
  if (!data.performed_at) return { error: "Performed-at date/time is required." };

  return { data };
}

export async function createLogAction(_: FormState, fd: FormData): Promise<FormState> {
  return save(parseLog(fd), q.createLog, "/");
}

export async function updateLogAction(id: number, _: FormState, fd: FormData): Promise<FormState> {
  return save(parseLog(fd), (data) => q.updateLog(id, data), "/");
}

export async function deleteLogAction(id: number): Promise<void> {
  await q.deleteLog(id);
  revalidatePath("/", "layout");
}
