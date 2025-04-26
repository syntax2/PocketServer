
'use client';

import type { LogEntry } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'; // Import Accordion
import { Code } from 'lucide-react'; // Import Code icon

const REFRESH_INTERVAL = 3000; // Refresh logs every 3 seconds (reduced interval)

export function LogDisplay() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    // Don't set loading to true on subsequent fetches to avoid flickering
    // setIsLoading(true);
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
        setIsLoading(false); // Set loading to false after first fetch or error
    }
  };

  useEffect(() => {
    fetchLogs(); // Initial fetch
    const intervalId = setInterval(fetchLogs, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  const getStatusColorClass = (status: number): string => {
     if (status >= 500) return 'bg-red-500 text-white border-red-600';
     if (status >= 400) return 'bg-yellow-500 text-black border-yellow-600';
     if (status >= 300) return 'bg-blue-500 text-white border-blue-600';
     return 'bg-green-500 text-white border-green-600'; // Green for 2xx success
   };

  return (
    <Card className="w-full max-w-5xl mx-auto my-8 shadow-lg rounded-lg">
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-semibold">PocketServer Logs</CardTitle>
        <CardDescription className="text-sm">Live feed of server requests, events, headers, and bodies.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/30 rounded-md text-sm">
            {error}
          </div>
        )}
        {isLoading && !error && (
            <div className="text-center p-6 text-muted-foreground">Loading logs...</div>
        )}
        <ScrollArea className="h-[600px] w-full border rounded-md p-0 bg-background shadow-inner">
          {logs.length === 0 && !isLoading && !error ? (
             <div className="text-center text-muted-foreground italic p-6">No logs yet. Try accessing <code className="bg-muted px-1 py-0.5 rounded text-xs">/api/serve/</code> or sending POST/PUT requests.</div>
          ) : (
            <Accordion type="multiple" className="w-full">
                 {logs.map((log, index) => (
                   <AccordionItem value={`log-${index}`} key={index} className="border-b last:border-b-0">
                     <AccordionTrigger className="px-4 py-2 hover:bg-muted/50 text-sm [&[data-state=open]>svg]:text-accent">
                         <div className="flex flex-wrap items-center gap-x-3 gap-y-1 w-full text-left">
                               <span className="text-muted-foreground font-medium min-w-[170px] text-xs">{log.timestamp}</span>
                               <Badge
                                 variant={'outline'}
                                 className={cn(
                                   "font-semibold px-2 py-0.5 rounded-full text-xs border", // Added border class
                                   getStatusColorClass(log.status)
                                 )}
                               >
                                 {log.status}
                               </Badge>
                               <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-xs">{log.method}</Badge>
                               <span className="font-medium text-primary break-all flex-1 min-w-[150px]">{log.path}</span>
                               <span className={cn(
                                 "text-xs italic ml-auto",
                                 log.status >= 400 ? "text-destructive" : "text-muted-foreground"
                               )}>
                                 {log.message}
                               </span>
                         </div>
                     </AccordionTrigger>
                     <AccordionContent className="px-4 pt-1 pb-3 bg-secondary/30">
                         {(log.headers || log.requestBody !== undefined) ? (
                           <div className="space-y-2 text-xs mt-1">
                             {log.headers && Object.keys(log.headers).length > 0 && (
                               <div>
                                 <h4 className="font-semibold mb-1 text-muted-foreground">Headers:</h4>
                                 <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs font-mono">
                                   {JSON.stringify(log.headers, null, 2)}
                                 </pre>
                               </div>
                             )}
                             {log.requestBody !== undefined && (
                               <div>
                                 <h4 className="font-semibold mb-1 text-muted-foreground">Request Body:</h4>
                                 <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs font-mono">
                                     {typeof log.requestBody === 'object'
                                         ? JSON.stringify(log.requestBody, null, 2)
                                         : String(log.requestBody)
                                     }
                                 </pre>
                               </div>
                             )}
                           </div>
                         ) : (
                            <p className="text-xs text-muted-foreground italic mt-1">No additional details (headers/body) logged for this entry.</p>
                         )}
                     </AccordionContent>
                   </AccordionItem>
                 ))}
            </Accordion>
          )}
        </ScrollArea>
         <p className="text-xs text-muted-foreground mt-4 p-1">
             <Code size={14} className="inline-block mr-1 align-text-bottom"/>
              Tip: Access static files via <code className="bg-muted px-1 py-0.5 rounded">/api/serve/your-file.html</code>. Files are in <code className="bg-muted px-1 py-0.5 rounded">public/static</code>. Send POST/PUT to the same path to see body logging.
         </p>
      </CardContent>
    </Card>
  );
}

