class StorageInterface {
  async uploadFile(file, publicKey) {}

  async getFile(filePath) {}

  async deleteFile(filePath) {}
}

module.exports = StorageInterface;
