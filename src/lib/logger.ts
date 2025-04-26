
export type LogEntry = {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  message: string;
  headers?: Record<string, string>; // Optional: Log relevant request headers
  requestBody?: any; // Optional: Log parsed request body (be cautious with sensitive data)
};

// Simple in-memory store for logs.
// Note: This will reset on server restart and is not suitable for production.
const logs: LogEntry[] = [];

const MAX_LOGS = 100; // Limit the number of logs stored in memory

export function addLog(logEntryData: Omit<LogEntry, 'timestamp'>): void {
  const timestamp = new Date().toISOString();
  const fullLogEntry: LogEntry = { ...logEntryData, timestamp };

  // Construct log message string
  let logString = `[${fullLogEntry.timestamp}] ${fullLogEntry.method} ${fullLogEntry.path} - ${fullLogEntry.status} ${fullLogEntry.message}`;
  if (fullLogEntry.headers) {
      logString += `\n  Headers: ${JSON.stringify(fullLogEntry.headers)}`;
  }
  if (fullLogEntry.requestBody !== undefined) {
       // Avoid logging large or sensitive bodies directly in console unless needed
       const bodyLog = typeof fullLogEntry.requestBody === 'object'
         ? JSON.stringify(fullLogEntry.requestBody)
         : String(fullLogEntry.requestBody);
      const truncatedBodyLog = bodyLog.length > 200 ? bodyLog.substring(0, 200) + '...' : bodyLog;
       logString += `\n  Body: ${truncatedBodyLog}`;
  }

  console.log(logString);

  logs.unshift(fullLogEntry); // Add to the beginning

  // Keep logs array size limited
  if (logs.length > MAX_LOGS) {
    logs.pop(); // Remove the oldest log
  }
}

export function getLogs(): LogEntry[] {
  // Return a copy to prevent direct mutation
  return [...logs];
}

export function clearLogs(): void {
  logs.length = 0;
}

