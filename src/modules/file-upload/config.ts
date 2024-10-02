import { diskStorage } from 'multer';
import { extname } from 'path';

export const storageConfig = (folder: string) =>
  diskStorage({
    destination: `./uploads/${folder}`,
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const fileName = `${file.originalname}-${uniqueSuffix}${ext}`;
      callback(null, fileName);
    },
  });
