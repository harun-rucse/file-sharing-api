const fs = require('fs');
const path = require('path');
const StorageInterface = require('./storage-interface');

class LocalFileStorage extends StorageInterface {
  async uploadFile(file, publicKey) {
    const fileExtension = file.originalname.split('.')[1];
    const fileName = `${publicKey}.${fileExtension}`;
    const filePath = path.join(process.env.FOLDER, fileName);
    const writeStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      writeStream.write(file.buffer);
      writeStream.on('finish', () => resolve(filePath));
      writeStream.end();
      writeStream.on('error', reject);
    });
  }

  async getFile(filePath) {
    return fs.createReadStream(filePath);
  }

  async deleteFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) return reject(err);

        resolve();
      });
    });
  }
}

module.exports = LocalFileStorage;
