export type LogEntry = {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  message: string;
};

// Simple in-memory store for logs.
// Note: This will reset on server restart and is not suitable for production.
const logs: LogEntry[] = [];

const MAX_LOGS = 100; // Limit the number of logs stored in memory

export function addLog(logEntry: Omit<LogEntry, 'timestamp'>): void {
  const timestamp = new Date().toISOString();
  const fullLogEntry: LogEntry = { ...logEntry, timestamp };

  console.log(
    `[${fullLogEntry.timestamp}] ${fullLogEntry.method} ${fullLogEntry.path} - ${fullLogEntry.status} ${fullLogEntry.message}`
  );

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
