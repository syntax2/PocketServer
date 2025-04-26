'use client';

import type { LogEntry } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const REFRESH_INTERVAL = 5000; // Refresh logs every 5 seconds

export function LogDisplay() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: LogEntry[] = await response.json();
      setLogs(data);
      setError(null); // Clear error on successful fetch
    } catch (e: any) {
      console.error('Failed to fetch logs:', e);
      setError(`Failed to load logs: ${e.message}`);
      // Keep existing logs in case of temporary network issues
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLogs();

    // Set up interval for refreshing logs
    const intervalId = setInterval(fetchLogs, REFRESH_INTERVAL);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const getStatusVariant = (status: number): 'default' | 'destructive' | 'secondary' | 'outline' => {
    if (status >= 500) return 'destructive';
    if (status >= 400) return 'secondary'; // Use secondary for client errors like 404
    if (status >= 300) return 'outline';
    return 'default'; // Use default (teal based on theme) for success (2xx)
  };

  const getStatusColorClass = (status: number): string => {
     if (status >= 500) return 'bg-red-500 text-white';
     if (status >= 400) return 'bg-yellow-500 text-black';
     if (status >= 300) return 'bg-blue-500 text-white';
     return 'bg-green-500 text-white'; // Green for 2xx success
   };

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 shadow-md">
      <CardHeader>
        <CardTitle>PocketServer Logs</CardTitle>
        <CardDescription>Live feed of server requests and events.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/20 text-destructive border border-destructive rounded-md">
            {error}
          </div>
        )}
        {isLoading && !error && (
            <div className="text-center p-4 text-muted-foreground">Loading logs...</div>
        )}
        <ScrollArea className="h-[500px] w-full border rounded-md p-4 bg-secondary/30">
          {logs.length === 0 && !isLoading && !error ? (
             <div className="text-center text-muted-foreground italic">No logs yet. Make a request to /api/serve/...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-2 p-2 border-b border-border last:border-b-0 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-muted-foreground font-medium min-w-[160px]">{log.timestamp}</span>
                <Badge
                   variant={'outline'}
                   className={cn(
                     "font-semibold px-2 py-0.5 rounded text-xs",
                     getStatusColorClass(log.status) // Dynamic background/text color
                   )}
                 >
                    {log.status}
                 </Badge>
                <Badge variant="secondary" className="px-2 py-0.5 rounded text-xs">{log.method}</Badge>
                <span className="font-medium text-primary break-all flex-1 min-w-[150px]">{log.path}</span>
                <span className={cn(
                  "text-xs italic",
                   log.status >= 400 ? "text-destructive" : "text-muted-foreground",
                   "flex-shrink-0 ml-auto" // Push message to the right if space allows
                )}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </ScrollArea>
         <p className="text-xs text-muted-foreground mt-4">
              Tip: Access static files via <code className="bg-muted px-1 py-0.5 rounded">/api/serve/your-file-name.html</code> (defaults to <code className="bg-muted px-1 py-0.5 rounded">index.html</code> if no file is specified). Files are served from the <code className="bg-muted px-1 py-0.5 rounded">public/static</code> directory.
         </p>
      </CardContent>
    </Card>
  );
}
