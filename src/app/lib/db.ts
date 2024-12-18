import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'solidarity.rds.volces.com',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'hooke',
  password: process.env.DB_PASSWORD || 'Wo5527522',
  database: process.env.DB_NAME || 'solidarity',
});

export default sequelize; 