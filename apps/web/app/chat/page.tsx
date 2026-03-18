import { AuthGuard } from "@/components/auth-guard";
import { ChatShell } from "@/components/chat-shell";

export default function ChatPage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <ChatShell />
      </AuthGuard>
    </main>
  );
}
