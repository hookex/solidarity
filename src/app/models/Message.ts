import { DataTypes, Sequelize } from 'sequelize';
import type { MessageInstance, MessageCreationAttributes } from './types';
import sequelize from '../config/database';

const Message = sequelize.define<MessageInstance, MessageCreationAttributes>(
  'Message',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    modelId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    modelName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    questionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'sessions',
        key: 'id',
      },
    },
  },
  {
    tableName: 'messages',
    timestamps: true,
  }
);

export default Message;
