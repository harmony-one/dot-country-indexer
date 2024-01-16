import { ethers } from "ethers";
import isUrl from "is-url";
import { addDomain } from "../db/db";

async function parseTransaction(tx: ethers.providers.TransactionResponse) {
  const calldata = hexToBase64(tx.data);
  const commaIndex = calldata.indexOf(',');
  if (commaIndex === -1) {
    throw new Error('Transaction data does not contain a comma. Expected format: "identifier,url".');
  }

  const entry = calldata.substring(0, commaIndex).trim();
  const url = calldata.substring(commaIndex + 1).trim();

  if (!entry) {
    throw new Error('Entry is missing.');
  }

  if (!isUrl(url)) {
    throw new Error(`URL '${url}' extracted from the transaction data is not valid.`);
  }

  return { entry, url };
}

function hexToBase64(hex: string): string {
  const bytesArray = ethers.utils.arrayify(hex);
  return ethers.utils.toUtf8String(bytesArray);
}

export { parseTransaction };