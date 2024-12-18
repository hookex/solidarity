import type { Message, CreateMessageRequest, UpdateMessageRequest } from './types';

const API_BASE = '/api/messages';

export const messagesApi = {
  create: async (message: Omit<Message, 'id'>) => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    return response.json();
  },

  update: async (id: number, content: string) => {
    const response = await fetch(API_BASE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, content }),
    });
    return response.json();
  },
}; 