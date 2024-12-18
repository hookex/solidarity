import Message from './Message';
import Session from './Session';
import User from './User';

// 定义模型之间的关联关系
Message.belongsTo(Session, {
  foreignKey: 'sessionId',
  as: 'session',
});

Session.hasMany(Message, {
  foreignKey: 'sessionId',
  as: 'messages',
});

// 用户与会话的关联关系
Session.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Session, {
  foreignKey: 'userId',
  as: 'sessions',
});

export {
  Message,
  Session,
  User,
};
