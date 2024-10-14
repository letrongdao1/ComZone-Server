import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { extname } from 'path';
import { FirebaseService } from './firebase.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('File upload')
@Controller('file')
export class FileUploadController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async handleUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded!');
    }

    try {
      const uploadedUrl = await this.firebaseService.uploadImage(file, 'files');
      return {
        message: 'File was uploaded successfully!',
        fileUrl: uploadedUrl, // Return the Firebase download URL
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'File upload failed!');
    }
  }

  // Upload multiple files
  @Post('upload/multiple')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file1', maxCount: 1 },
      { name: 'file2', maxCount: 1 },
    ]),
  )
  async uploadFiles(
    @UploadedFiles()
    files: {
      file1?: Express.Multer.File[];
      file2?: Express.Multer.File[];
    },
  ) {
    if (!files.file1 || !files.file2) {
      throw new BadRequestException('Both files are required!');
    }

    try {
      const uploadFile1Url = await this.firebaseService.uploadImage(
        files.file1[0],
        'files',
      );
      const uploadFile2Url = await this.firebaseService.uploadImage(
        files.file2[0],
        'files',
      );

      return {
        message: 'Files were uploaded successfully!',
        files: {
          file1Url: uploadFile1Url,
          file2Url: uploadFile2Url,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Files upload failed!');
    }
  }

  // Only handle uploading jpeg/png files with the maximum size of 5MB
  @Post('upload/image-only')
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname);
        const validExtArr = ['.jpg', '.jpeg', '.png'];
        if (!validExtArr.includes(ext)) {
          req.fileValidationError =
            'Invalid image file. Only .jpg, .jpeg, .png files are allowed!';
          callback(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError =
              'Image file is too large. The image size should be less than 5MB!';
            callback(null, false);
          } else {
            callback(null, true);
          }
        }
      },
    }),
  )
  async handleImageUploadOnly(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }

    if (!file) {
      throw new BadRequestException('File is required!');
    }

    try {
      const imageUrl = await this.firebaseService.uploadImage(file, 'images');
      return {
        message: 'Image was uploaded successfully!',
        imageUrl, // Return the Firebase download URL
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Image upload failed!');
    }
  }
  // @Post('image')
  // @UseInterceptors(FileInterceptor('image'))
  // async addImage(
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({ maxSize: 5000000 }), // 5MB max file size
  //         new FileTypeValidator({ fileType: 'image/*' }), // Allow only image files
  //       ],
  //     }),
  //   )
  //   file: Express.Multer.File,
  // ): Promise<any> {
  //   // Ensure it returns a response
  //   console.log('Received file:', file); // Log file details

  //   try {
  //     const updateVoucherImage = await this.firebaseService.uploadImage(file); // Upload file to Firebase
  //     return {
  //       message: 'Image uploaded successfully!',
  //       imageUrl: updateVoucherImage, // Return the download URL
  //       contentType: file.mimetype,
  //     };
  //   } catch (error) {
  //     console.error('Error uploading file:', error); // Log any errors
  //     throw new BadRequestException('Error uploading image'); // Return an error response
  //   }
  // }
}
