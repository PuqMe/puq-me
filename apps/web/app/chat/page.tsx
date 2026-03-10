import { AuthGuard } from "@/components/auth-guard";
import { ChatShell } from "@/components/chat-shell";

export default function ChatPage() {
  return (
    <main className="safe-px safe-pb mx-auto min-h-screen w-full max-w-md py-4">
      <AuthGuard>
        <ChatShell />
      </AuthGuard>
    </main>
  );
}
