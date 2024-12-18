import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import type { UserCreationAttributes, UserInstance } from '../models/types';

export class UserService {
  static async createUser(userData: Omit<UserCreationAttributes, 'id'>): Promise<UserInstance> {
    try {
      const user = await User.create({
        ...userData,
        id: uuidv4(),
      });
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<UserInstance | null> {
    try {
      return await User.findByPk(id);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  static async getUserByEmail(email: string): Promise<UserInstance | null> {
    try {
      return await User.findOne({ where: { email } });
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  static async updateUser(id: string, updateData: Partial<UserCreationAttributes>): Promise<UserInstance> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }
      
      await user.update(updateData);
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async updateLastLogin(id: string): Promise<void> {
    try {
      await User.update(
        { lastLoginAt: new Date() },
        { where: { id } }
      );
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  static async validateCredentials(email: string, password: string): Promise<UserInstance | null> {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return null;
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error validating credentials:', error);
      throw error;
    }
  }
}

export default UserService;
