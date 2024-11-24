import { IncomingMessage } from 'http';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: IncomingMessage) {
    return NextResponse.json({ message: 'Hello, Hooke!' });
}