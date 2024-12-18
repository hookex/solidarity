import DatabaseService from '../src/app/services/DatabaseService';

async function initializeDatabase() {
  const dbService = DatabaseService.getInstance();
  
  try {
    // 连接数据库并同步模型
    await dbService.connect();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  } finally {
    await dbService.disconnect();
  }
}

initializeDatabase();
