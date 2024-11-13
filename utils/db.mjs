// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString: "postgresql://postgres:Wjc-jp005@localhost:5432/Thread", // ตั้งค่า connection string
});

export default connectionPool;