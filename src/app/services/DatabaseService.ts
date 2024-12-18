import { Sequelize } from 'sequelize';

class DatabaseService {
  private static instance: DatabaseService;
  private sequelize: Sequelize;

  private constructor() {
    this.sequelize = new Sequelize({
      dialect: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'solidarity',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getSequelize(): Sequelize {
    return this.sequelize;
  }

  public async connect(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      
      // 同步所有模型
      await this.sequelize.sync({ alter: true });
      console.log('All models were synchronized successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.sequelize.close();
      console.log('Database connection closed.');
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error;
    }
  }
}

export default DatabaseService;
