import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

// Every page reads live data from Postgres.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Maintenance Log",
  description: "Server maintenance log",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">
            <span className="prompt">root@ops:~$</span> maint_log
          </Link>
          <nav>
            <Link href="/">[logs]</Link>
            <Link href="/logs/new">[+ new log]</Link>
            <Link href="/servers">[servers]</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
