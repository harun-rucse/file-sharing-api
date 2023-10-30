const crypto = require('crypto');

class KeyService {
  generatePublicKey() {
    return crypto.randomBytes(16).toString('hex');
  }

  generatePrivateKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = KeyService;
