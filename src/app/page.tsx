import { LogDisplay } from '@/components/log-display';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 lg:p-12">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">PocketServer Monitor</h1>
            <p className="text-muted-foreground">Learn how web servers work by observing request handling and static file serving.</p>
        </div>
      <LogDisplay />
    </main>
  );
}
