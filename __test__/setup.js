const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.test' });

const directoryPath = process.env.FOLDER;

beforeAll(async () => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }
});

afterAll(async () => {
  if (fs.existsSync(directoryPath)) {
    fs.rm(directoryPath, { recursive: true }, () => {});
  }
});
