import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`RentyPark API listening on port ${port}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
