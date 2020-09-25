import mongoose from 'mongoose';
import dotenv from 'dotenv';
//import cluster from 'cluster';
//import os from 'os';

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './config.env' });
}

import app from './app';

let DB = process.env.DATABASE!.replace(
  '<DATABASE_NAME>',
  process.env.DATABASE!
);
DB = process.env.DATABASE!.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD!
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

const port: number | string = process.env.PORT || 3000;

let server: any;
// if (cluster.isMaster) {
//   const numsCpu = os.cpus().length;

//   for (let i = 0; i < numsCpu; i++) cluster.fork();

//   cluster.on('exit', function (worker, code, signal) {
//     console.log('worker' + worker.process.pid + 'died');
//     console.log('Forking another worker process instead of that');
//     cluster.fork();
//   });
// } else {
//   //Worker process
//   //Worker can share my TCP process
//   // In this case is an http
//   server = app.listen(port, () => {
//     console.log(`App running on port ${port}...`);
//   });
// }

server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
