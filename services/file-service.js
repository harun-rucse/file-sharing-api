const fs = require('fs');
const path = require('path');
const KeyService = require('./key-service');
const AppError = require('../utils/app-error');

class FileAccess {
  constructor(uploadFolder) {
    this.uploadFolder = uploadFolder;
    this.fileMapping = {};
  }

  async uploadFile(file) {
    const keyService = new KeyService();
    const privateKey = keyService.generatePrivateKey();
    const publicKey = keyService.generatePublicKey();

    const fileExtension = file.originalname.split('.')[1];
    const fileName = `${publicKey}.${fileExtension}`;
    const filePath = path.join(this.uploadFolder, fileName);
    const writeStream = fs.createWriteStream(filePath);

    this.fileMapping[privateKey] = { publicKey, filePath };

    return new Promise((resolve, reject) => {
      writeStream.write(file.buffer);
      writeStream.on('finish', () => resolve({ publicKey, privateKey }));
      writeStream.end();
      writeStream.on('error', reject);
    });
  }

  async getFile(publicKey) {
    const fileMapping = Object.values(this.fileMapping).find(
      (mapping) => mapping.publicKey === publicKey
    );

    if (fileMapping) {
      return fs.createReadStream(fileMapping.filePath);
    } else {
      throw new AppError('File not found for the provided publicKey', 404);
    }
  }

  async deleteFile(privateKey) {
    const fileMapping = this.fileMapping[privateKey];

    if (fileMapping) {
      return new Promise((resolve, reject) => {
        fs.unlink(fileMapping.filePath, (err) => {
          if (err) {
            reject(err);
          } else {
            delete this.fileMapping[privateKey];
            resolve();
          }
        });
      });
    } else {
      throw new AppError('File not found for the provided privateKey', 404);
    }
  }
}

module.exports = FileAccess;
