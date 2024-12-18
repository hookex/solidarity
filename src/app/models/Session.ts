import { DataTypes, Sequelize } from 'sequelize';
import type { SessionInstance, SessionCreationAttributes } from './types';
import sequelize from '../config/database';

const Session = sequelize.define<SessionInstance, SessionCreationAttributes>(
  'Session',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    lastActive: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'sessions',
    timestamps: true,
  }
);

export default Session;
