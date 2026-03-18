import axios from '../lib/axios';
import { UploadedFile, UploadFileParams } from '../types/file';

export class FileService {
  public static async uploadFile(file: File, params?: UploadFileParams): Promise<UploadedFile> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axios.post('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params,
      });

      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
