import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { ChatShell } from "@/components/chat-shell";

export const metadata: Metadata = {
  title: "Chat • PuQ.me",
  description: "Nachrichten und Unterhaltungen",
  openGraph: {
    title: "Chat • PuQ.me",
    description: "Nachrichten und Unterhaltungen",
  },
};

export default function ChatPage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <ChatShell />
      </AuthGuard>
    </main>
  );
}
