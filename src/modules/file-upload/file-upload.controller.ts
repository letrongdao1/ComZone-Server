import {
  BadRequestException,
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { extname } from 'path';
import { storageConfig } from './config';

@Controller('file')
export class FileUploadController {
  constructor() {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storageConfig('files'),
    }),
  )
  handleUpload(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return {
      message: 'File was uploaded successfully!',
      file,
    };
  }

  //Upload multiple files
  @Post('upload/multiple')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file1', maxCount: 1 },
      { name: 'file2', maxCount: 1 },
    ]),
  )
  uploadFile(
    @UploadedFiles()
    files: {
      file1?: Express.Multer.File[];
      file2?: Express.Multer.File[];
    },
  ) {
    console.log(files);
    return {
      message: 'Files were uploaded successfully!',
      files,
    };
  }

  //Only handle uploading jpeg file with the maximum size of 10MB
  @Post('upload/image-only')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storageConfig('images'),
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname);
        const validExtArr = ['.jpg', '.jpeg', '.png'];
        if (!validExtArr.includes(ext)) {
          req.fileValidationError =
            'Invalid image file. Only .jpg, .jpeg, .png files are valid!';
          callback(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError =
              'Image file is too large in size. The image size should be less than 5MB!';
            callback(null, false);
          } else {
            callback(null, true);
          }
        }
      },
    }),
  )
  handleImageUploadOnly(
    @Req() req: any,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new BadRequestException('Required file!');
    }

    console.log(file);
    return {
      message: 'Image was uploaded successfully!',
      file,
    };
  }
}
