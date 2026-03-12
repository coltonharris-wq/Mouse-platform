/**
 * GET /api/export/conversations?customer_id=xxx&format=csv
 * Exports all chat conversations as CSV download.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseQuery } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');
  const format = request.nextUrl.searchParams.get('format') || 'csv';

  if (!customerId) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
  }

  try {
    // Get all conversations for this customer
    const conversations = await supabaseQuery(
      'conversations',
      'GET',
      undefined,
      `customer_id=eq.${customerId}&select=id,created_at&order=created_at.asc`
    );

    if (!conversations || conversations.length === 0) {
      if (format === 'csv') {
        return new NextResponse('Date,Role,Message\n', {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="conversations.csv"',
          },
        });
      }
      return NextResponse.json({ messages: [] });
    }

    // Get all messages across conversations
    const allMessages: { date: string; role: string; content: string }[] = [];
    for (const conv of conversations) {
      const messages = await supabaseQuery(
        'messages',
        'GET',
        undefined,
        `conversation_id=eq.${conv.id}&select=role,content,created_at&order=created_at.asc`
      );
      if (messages) {
        for (const m of messages) {
          allMessages.push({
            date: m.created_at,
            role: m.role,
            content: m.content,
          });
        }
      }
    }

    if (format === 'csv') {
      const csvRows = ['Date,Role,Message'];
      for (const m of allMessages) {
        const escaped = m.content.replace(/"/g, '""').replace(/\n/g, ' ');
        csvRows.push(`"${m.date}","${m.role}","${escaped}"`);
      }
      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="conversations.csv"',
        },
      });
    }

    return NextResponse.json({ messages: allMessages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[EXPORT_CONVERSATIONS]', message);
    return NextResponse.json({ error: 'Failed to export conversations' }, { status: 500 });
  }
}
