import { Message, Session } from '../models';
import type { MessageCreationAttributes, MessageInstance } from '../models/types';

export class MessageService {
  static async createMessage(messageData: MessageCreationAttributes): Promise<MessageInstance> {
    try {
      // 确保会话存在
      const [session] = await Session.findOrCreate({
        where: { id: messageData.sessionId },
        defaults: { lastActive: new Date() }
      });

      // 创建消息
      const message = await Message.create(messageData);

      // 更新会话的最后活动时间
      await session.update({ lastActive: new Date() });

      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async getMessagesBySession(sessionId: string): Promise<MessageInstance[]> {
    try {
      return await Message.findAll({
        where: { sessionId },
        order: [['timestamp', 'ASC']],
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  static async updateMessage(id: string, content: string): Promise<MessageInstance> {
    try {
      const message = await Message.findByPk(id);
      if (!message) {
        throw new Error('Message not found');
      }
      
      await message.update({ content });
      return message;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }
}

export default MessageService;
