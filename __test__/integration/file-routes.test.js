const path = require('path');
const request = require('supertest');
const app = require('../../app');

describe('/api/files', () => {
  let publicKey;
  let privateKey;
  describe('POST /', () => {
    let file;

    beforeEach(async () => {
      file = path.join(`${__dirname}`, '..', 'sample-file.txt');
    });

    const exec = () => {
      return request(app).post('/api/files').attach('file', file);
    };

    it('should return 400 if file is not provided', async () => {
      file = undefined;
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should upload a new file', async () => {
      const res = await exec();

      publicKey = res.body.publicKey;
      privateKey = res.body.privateKey;

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('publicKey');
      expect(res.body).toHaveProperty('privateKey');
    });
  });

  describe('GET /:publicKey', () => {
    let pubKey;
    beforeEach(async () => {
      pubKey = publicKey;
    });

    const exec = () => {
      return request(app).get(`/api/files/${pubKey}`);
    };

    it('should return 400 if publicKey is not provided', async () => {
      pubKey = null;
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 200 if successfull download', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /:privateKey', () => {
    let prKey;
    beforeEach(async () => {
      prKey = privateKey;
    });

    const exec = () => {
      return request(app).delete(`/api/files/${prKey}`);
    };

    it('should return 400 if privateKey is not provided', async () => {
      prKey = null;
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 200 if successfull delete', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });
  });
});
