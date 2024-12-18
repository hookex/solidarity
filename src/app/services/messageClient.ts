import { Message } from '@/app/models/types';

export const MessageClient = {
  async createMessage(message: Message): Promise<Message> {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create message');
    }
    
    return response.json();
  },

  async updateMessage(id: string, content: string): Promise<Message> {
    const response = await fetch('/api/messages', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, content }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update message');
    }
    
    return response.json();
  },
};
