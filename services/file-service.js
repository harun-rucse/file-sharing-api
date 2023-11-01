const KeyService = require('./key-service');
const AppError = require('../utils/app-error');
const logger = require('../logger');

class FileAccess {
  constructor(storageProvider) {
    this.fileMapping = {};
    this.storageProvider = storageProvider;
    this.keyService = new KeyService();
  }

  async uploadFile(file) {
    const privateKey = this.keyService.generatePrivateKey();
    const publicKey = this.keyService.generatePublicKey();

    const filePath = await this.storageProvider.uploadFile(file, publicKey);
    this.fileMapping[privateKey] = { publicKey, filePath };

    return { publicKey, privateKey };
  }

  async getFile(publicKey) {
    const fileMapping = Object.values(this.fileMapping).find(
      (mapping) => mapping.publicKey === publicKey
    );

    if (fileMapping) {
      return this.storageProvider.getFile(fileMapping.filePath);
    } else {
      throw new AppError('File not found for the provided publicKey', 404);
    }
  }

  async deleteFile(privateKey) {
    const fileMapping = this.fileMapping[privateKey];

    if (fileMapping) {
      await this.storageProvider.deleteFile(fileMapping.filePath);
      return delete this.fileMapping[privateKey];
    } else {
      throw new AppError('File not found for the provided privateKey', 404);
    }
  }

  async cleanUpFiles() {
    for (const privateKey in this.fileMapping) {
      const fileMapping = this.fileMapping[privateKey];

      try {
        await this.storageProvider.deleteFile(fileMapping.filePath);
      } catch (error) {
        logger.error(`Error cleanup file: ${fileMapping.filePath}`, error);
      }
    }

    this.fileMapping = {};
  }
}

module.exports = FileAccess;
