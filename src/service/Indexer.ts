import { ethers } from 'ethers';
import { isAddrEqual } from '../utils/blockchain';
import { config } from '../config';
import { parseTransaction } from '../utils/transaction';
import { EntryInfo, getEntryInfo, storeEntry } from '../utils/entry';

const INTERVAL = 500; // 500 ms
const MAX_RETRIES = 3;

class Indexer {
  protected provider: ethers.providers.JsonRpcProvider;
  protected lastBlockNum: number | undefined;
  protected interval: number;

  constructor(rpc: string, interval: number = INTERVAL) {
    this.provider = new ethers.providers.JsonRpcProvider(rpc);
    this.interval = interval;
  }

  public async start() {
    console.log('Starting Indexer Service');

    const processIndexing = async () => {
      let retryCount = 0;
      while (retryCount <= MAX_RETRIES) {
        try {
          const currBlockNum = await this.fetchBlockNum();
          if (this.lastBlockNum && this.lastBlockNum < currBlockNum) {
            for (let blockNum = this.lastBlockNum + 1; blockNum <= currBlockNum; blockNum++) {
              const newTxs = await this.fetchTxs(blockNum);
              for (const tx of newTxs) {
                try {
                  console.log(`Handling transaction: ${tx.hash}`);
                  await this.handleTx(tx);
                } catch (error) {
                  console.error(`Failed to process transaction ${tx.hash}: `, error);
                }
              }
              this.lastBlockNum = blockNum;
              console.log(`Updated blockNum: ${blockNum}`);
            }
          }
          break;
        } catch (error) {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying: attempt ${retryCount}/${MAX_RETRIES}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // exponential back-off
          } else {
            console.log('Max retries reached. Proceeding to next cycle.');
            break;
          }
        }
      }
      setTimeout(processIndexing, this.interval);
    }

    processIndexing();
  }

  protected async fetchBlockNum(): Promise<number> {
    const currBlockNum = await this.provider.getBlockNumber();
    if (this.lastBlockNum === undefined) {
      this.lastBlockNum = currBlockNum - 1;
    }
    return currBlockNum;
  }

  protected async fetchTxs(blockNum: number): Promise<ethers.providers.TransactionResponse[]> {
    const newTxs: ethers.providers.TransactionResponse[] = [];
    try {
      const block = await this.provider.getBlockWithTransactions(blockNum);
      const filteredTxs = block.transactions.filter(tx =>
        tx.to && isAddrEqual(tx.to, config.indexer.DST_ADDRESS));
      newTxs.push(...filteredTxs);
    } catch (error) {
      console.error('Error fetching transactions:', error as Error);
    }
    return newTxs;
  }

  protected async handleTx(tx: ethers.providers.TransactionResponse): Promise<void> {
    try {
      const { entry, url } = await parseTransaction(tx);
      const urlInfo: EntryInfo = getEntryInfo(entry);
      await storeEntry(urlInfo, url);
      console.log(`Tx ${tx.hash}`);
    } catch (error) {
      console.error(`Failed to handle transaction ${tx.hash}: ${error}`)
    }
  }
}

export default Indexer;