// models/db.js  SINGLETON
import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance; // Devuelve la instancia ya creada
    }
    this.pool = null;
    Database.instance = this; // Guarda la instancia Singleton
  }

  async getPool() {
    if (this.pool) return this.pool;

    try {
      this.pool = await sql.connect({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      });

      console.log("✔ Conectado a SQL Server (Singleton)");
      return this.pool;
    } catch (err) {
      console.error("❌ Error al conectar a SQL Server:", err);
      throw err;
    }
  }
}

// Crear instancia de la clase
const database = new Database();

// Export nombrado getPool
export const getPool = () => database.getPool();

// Export de sql para usar tipos y funciones
export { sql };
