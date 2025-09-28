import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'myserverhostingb.duckdns.org',
  database: 'starsocial_temp',
  password: '@Strong123',
  port: 5432,
});

export default pool;