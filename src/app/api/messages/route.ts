import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/app/services/MessageService';
import type { CreateMessageRequest, UpdateMessageRequest } from './types';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json() as CreateMessageRequest;
    const result = await MessageService.createMessage(message);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, content } = await request.json() as UpdateMessageRequest;
    const result = await MessageService.updateMessage(id, content);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}
