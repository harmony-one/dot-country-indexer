import { Pool } from 'pg';
import { config } from '../config';

const DEFAULT_URL = 'https://1.country';

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port as number,
});

async function query(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res;
}

async function addDomain(name: string, url: string) {
  const result = await query(`
    INSERT INTO domains (name, url) 
    VALUES ($1, $2) 
    ON CONFLICT (name) DO UPDATE 
    SET url = EXCLUDED.url 
    RETURNING *`,
    [name, url]
  );
  return result.rows[0];
}


async function addUrl(identifier: string, type: 'path' | 'subdomain', url: string, domainName: string) {
  let domain = await fetchDomainByName(domainName);
  if (!domain) {
    domain = await addDomain(domainName, DEFAULT_URL);
  }

  const result = await query(`
    INSERT INTO urls (identifier, type, url, domain_id) 
    VALUES ($1, $2, $3, $4) 
    ON CONFLICT (domain_id, identifier, type) DO UPDATE 
    SET url = EXCLUDED.url 
    RETURNING *`,
    [identifier, type, url, domain.domain_id]
  );
  return result.rows[0];
}

async function fetchDomainByName(name: string) {
  const result = await query('SELECT * FROM domains WHERE name = $1', [name]);
  return result.rows[0];
}

async function fetchUrlsByDomainName(domainName: string) {
  const domain = await fetchDomainByName(domainName);
  if (!domain) return [];

  const result = await query('SELECT * FROM urls WHERE domain_id = $1', [domain.domain_id]);
  return result.rows;
}

export { addDomain, addUrl, fetchDomainByName, fetchUrlsByDomainName };