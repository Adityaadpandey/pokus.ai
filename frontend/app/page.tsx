import { AgentChat } from "@/components/AgentChat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">


      <div className="relative flex place-items-center w-full max-w-2xl">
        <AgentChat />
      </div>
    </main>
  );
}
