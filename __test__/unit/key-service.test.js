const KeyService = require('../../services/key-service');

describe('generatePublicKey', () => {
  it('should return a hexadecimal string of length 32', () => {
    const keyService = new KeyService();
    const publicKey = keyService.generatePublicKey();

    expect(publicKey).toMatch(/^[a-f0-9]{32}$/);
  });
});

describe('generatePrivateKey', () => {
  it('should return a hexadecimal string of length 64', () => {
    const keyService = new KeyService();
    const privateKey = keyService.generatePrivateKey();

    expect(privateKey).toMatch(/^[a-f0-9]{64}$/);
  });
});
