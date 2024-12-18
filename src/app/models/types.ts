import { Model, Optional } from 'sequelize';

// User 接口
export interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'avatar'> {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

// Message 接口
export interface MessageAttributes {
  id: string;
  role: string;
  content: string;
  timestamp: string;
  modelId?: string;
  modelName?: string;
  questionId?: string;
  sessionId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MessageCreationAttributes extends Optional<MessageAttributes, 'createdAt' | 'updatedAt'> {}

export interface MessageInstance
  extends Model<MessageAttributes, MessageCreationAttributes>,
    MessageAttributes {}

// Session 接口
export interface SessionAttributes {
  id: string;
  lastActive: Date;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SessionCreationAttributes extends Optional<SessionAttributes, 'createdAt' | 'updatedAt' | 'userId'> {}

export interface SessionInstance
  extends Model<SessionAttributes, SessionCreationAttributes>,
    SessionAttributes {}
