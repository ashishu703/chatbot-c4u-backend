const AdminRepository = require('../repositories/AdminRepository');
const bcrypt = require('bcrypt');
const { folderExists, downloadAndExtractFile } = require('../utils/fileUtils');
const { executeQueries } = require('../utils/validation');
const path = require('path');
const mysql = require('mysql2/promise');

class AppService {
  adminRepository;
  constructor() {
    this.adminRepository = new AdminRepository();
  }
  async checkInstall() {
    const filePath = path.join(__dirname, '..', 'client', 'public', 'static');
    return folderExists(filePath);
  }

  async installApp(files) {
    const filePath = path.join(__dirname, '..', 'client', 'public', 'static');
    if (folderExists(filePath)) {
      return { success: true, msg: 'Your app is already installed' };
    }
    const outputPath = path.join(__dirname, '..', 'client', 'public');
    return await downloadAndExtractFile(files, outputPath);
  }

  async updateApp({ password, queries, newQueries }, files) {
    if (!password) {
      throw new Error('Admin password missing');
    }
    const admin = await this.adminRepository.findFirst();
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new Error('Invalid admin password. Please give a correct admin password');
    }

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB
    });

    try {
      if (queries && JSON.parse(queries)?.length > 0) {
        const parsedQueries = JSON.parse(queries);
        if (Array.isArray(parsedQueries) && parsedQueries.length > 0) {
          await executeQueries(parsedQueries, connection);
        }
      }

      if (newQueries && JSON.parse(newQueries)?.length > 0) {
        const newQuery = JSON.parse(newQueries);
        await Promise.all(
          newQuery?.map(async (i) => {
            const { run, check } = i;
            const [checkExist] = await connection.query(check);
            if (checkExist.length < 1) {
              await connection.query(run);
            }
          })
        );
      }
    } finally {
      await connection.end();
    }

    const outputPath = path.join(__dirname, '..');
    return await downloadAndExtractFile(files, outputPath);
  }
}

module.exports = AppService;