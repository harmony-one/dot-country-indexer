import dotenv from 'dotenv';

dotenv.config();

export const config = {
  rpc: {
    RPC_URL: process.env.RPC_URL || 'https://api.s0.t.hmny.io'
  },
  indexer: {
    DST_ADDRESS: process.env.DST_ADDRESS || ''
  },
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  }
}