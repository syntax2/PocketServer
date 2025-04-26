import { NextResponse } from 'next/server';
import { getLogs } from '@/lib/logger';

export async function GET() {
  try {
    const logs = getLogs();
    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

// Optionally clear logs (e.g., for testing or maintenance)
export async function DELETE() {
    try {
      // clearLogs(); // Assuming you have a clearLogs function in logger.ts
      return NextResponse.json({ message: 'Logs cleared (feature disabled)' }, { status: 200 });
    } catch (error) {
      console.error("Error clearing logs:", error);
      return NextResponse.json({ error: 'Failed to clear logs' }, { status: 500 });
    }
}
