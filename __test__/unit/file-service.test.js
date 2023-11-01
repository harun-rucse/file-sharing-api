const FileAccess = require('../../services/file-service');
const KeyService = require('../../services/key-service');
const AppError = require('../../utils/app-error');
const logger = require('../../logger');

// Mock the dependencies
jest.mock('../../services/key-service');
jest.mock('../../utils/app-error');
jest.mock('../../logger');

describe('FileAccess', () => {
  let access;
  let storageProviderMock;

  beforeEach(() => {
    // Create a mock for the storage provider and reset all mocks before each test
    storageProviderMock = {
      uploadFile: jest.fn(),
      getFile: jest.fn(),
      deleteFile: jest.fn(),
    };
    jest.clearAllMocks();

    // Create a new FileAccess instance with the mock storage provider
    access = new FileAccess(storageProviderMock);
  });

  describe('uploadFile', () => {
    it('should upload a file and return public and private keys', async () => {
      const fakePublicKey = 'fakePublicKey';
      const fakePrivateKey = 'fakePrivateKey';
      const fakeFilePath = 'fakeFilePath';

      // Mock the KeyService
      KeyService.prototype.generatePublicKey.mockReturnValue(fakePublicKey);
      KeyService.prototype.generatePrivateKey.mockReturnValue(fakePrivateKey);

      // Mock the storage provider to return a fake file path
      storageProviderMock.uploadFile.mockResolvedValue(fakeFilePath);

      const fakeFile = {
        buffer: 'fakeFileContent',
        originalname: 'fakeFileName.txt',
      };

      const result = await access.uploadFile(fakeFile);

      expect(result).toEqual({
        publicKey: fakePublicKey,
        privateKey: fakePrivateKey,
      });
      expect(storageProviderMock.uploadFile).toHaveBeenCalledWith(
        fakeFile,
        fakePublicKey
      );
      expect(access.fileMapping[fakePrivateKey]).toEqual({
        publicKey: fakePublicKey,
        filePath: fakeFilePath,
      });
    });
  });

  describe('getFile', () => {
    it('should get a file by publicKey', async () => {
      const fakePublicKey = 'fakePublicKey';
      const fakePrivateKey = 'fakePrivateKey';
      const fakeFilePath = 'fakeFilePath';
      const fakeReadStream = 'fakeReadStream';
      access.fileMapping[fakePrivateKey] = {
        publicKey: fakePublicKey,
        filePath: fakeFilePath,
      };

      // Mock the storage provider to return a fake readable stream
      storageProviderMock.getFile.mockReturnValue(fakeReadStream);

      const result = await access.getFile(fakePublicKey);

      expect(result).toBe(fakeReadStream);
      expect(storageProviderMock.getFile).toHaveBeenCalledWith(fakeFilePath);
    });

    it('should throw an AppError when the file is not found', async () => {
      const fakePublicKey = 'nonExistentPublicKey';

      try {
        await access.getFile(fakePublicKey);
      } catch (error) {
        expect(error instanceof AppError).toBe(true);
        expect(storageProviderMock.getFile).not.toHaveBeenCalled();
      }
    });
  });

  describe('deleteFile', () => {
    it('should delete a file by privateKey', async () => {
      const fakePublicKey = 'fakePublicKey';
      const fakePrivateKey = 'fakePrivateKey';
      const fakeFilePath = 'fakeFilePath';
      access.fileMapping[fakePrivateKey] = {
        publicKey: fakePublicKey,
        filePath: fakeFilePath,
      };

      // Mock the storage provider
      storageProviderMock.deleteFile.mockResolvedValue();

      await access.deleteFile(fakePrivateKey);

      expect(storageProviderMock.deleteFile).toHaveBeenCalledWith(fakeFilePath);
      expect(access.fileMapping[fakePrivateKey]).toBeUndefined();
    });

    it('should throw an AppError when the file is not found', async () => {
      const fakePrivateKey = 'nonExistentPrivateKey';

      try {
        await access.deleteFile(fakePrivateKey);
      } catch (error) {
        expect(error instanceof AppError).toBe(true);
        expect(storageProviderMock.deleteFile).not.toHaveBeenCalled();
      }
    });
  });

  describe('cleanUpFiles', () => {
    it('should clean up all files', async () => {
      // Mock the storage provider
      storageProviderMock.deleteFile.mockResolvedValue();

      // Add some fake file mappings
      access.fileMapping = {
        privateKey1: { publicKey: 'publicKey1', filePath: 'file1' },
        privateKey2: { publicKey: 'publicKey2', filePath: 'file2' },
      };

      await access.cleanUpFiles();

      // Ensure all files are deleted
      expect(storageProviderMock.deleteFile).toHaveBeenCalledWith('file1');
      expect(storageProviderMock.deleteFile).toHaveBeenCalledWith('file2');

      // Ensure the fileMapping is empty
      expect(access.fileMapping).toEqual({});
    });

    it('should handle errors when cleaning up files', async () => {
      // Mock the storage provider to reject the delete operation
      storageProviderMock.deleteFile.mockRejectedValue(
        new Error('File deletion failed')
      );

      // Add some fake file mappings
      access.fileMapping = {
        privateKey1: { publicKey: 'publicKey1', filePath: 'file1' },
        privateKey2: { publicKey: 'publicKey2', filePath: 'file2' },
      };

      await access.cleanUpFiles();

      // Ensure it logs an error and continues cleaning up
      expect(logger.error).toHaveBeenCalledWith(
        'Error cleanup file: file1',
        expect.any(Error)
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Error cleanup file: file2',
        expect.any(Error)
      );

      // Ensure the fileMapping is empty
      expect(access.fileMapping).toEqual({});
    });
  });
});
