import { addDomain, addUrl } from "../db/db";

type EntryType = 'domain' | 'subdomain' | 'path';

interface EntryInfo {
  domain: string;
  type: EntryType;
  identifier: string;
}

function getEntryInfo(entry: string): EntryInfo {
  let type: 'domain' | 'subdomain' | 'path';
  let domain: string;
  let identifier: string = '';

  const slashIndex = entry.indexOf('/');
  const dotIndex = entry.indexOf('.');

  if (slashIndex !== -1) {
    type = 'path';
    domain = entry.substring(0, slashIndex);
    identifier = entry.substring(slashIndex + 1);
  } else if (dotIndex !== -1) {
    type = 'subdomain';
    identifier = entry.substring(0, dotIndex);
    domain = entry.substring(dotIndex + 1);
  } else {
    type = 'domain';
    domain = entry;
  }

  return { domain, type, identifier };
}

async function storeEntry(entryInfo: EntryInfo, url: string): Promise<void> {
  console.log(`Storing Entry: Domain: ${entryInfo.domain} / Type: ${entryInfo.type} / Identifier: ${entryInfo.identifier}`);

  if (entryInfo.type === 'domain') {
    await addDomain(entryInfo.domain, url);
  } else {
    await addUrl(entryInfo.identifier, entryInfo.type, url, entryInfo.domain);
  }
}

export { EntryInfo, getEntryInfo, storeEntry };