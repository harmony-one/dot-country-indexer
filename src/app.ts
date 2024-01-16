import express from 'express';
import Indexer from './service/Indexer';
import { config } from './config';
import domainRoutes from './api/routes/domainRoutes';

const app = express();
const port = 3000;

const indexer = new Indexer(config.rpc.RPC_URL);
indexer.start();


app.get('/', (_, res) => {
  res.send('hello world');
});

app.use('/domain', domainRoutes);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
