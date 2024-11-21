import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
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

  // Upload up to 4 image files
  @Post('upload/multiple-images')
  @UseInterceptors(
    FilesInterceptor('images', 8), // Use FilesInterceptor to handle multiple files (up to 4)
  )
  async uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[]) {
    console.log(files);
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required!');
    }

    if (files.length > 8) {
      throw new BadRequestException('You can upload a maximum of 4 images!');
    }

    const validExtArr = ['.jpg', '.jpeg', '.png'];
    const imageUrls = [];

    try {
      for (const file of files) {
        const ext = extname(file.originalname).toLowerCase();

        // Validate file extension
        if (!validExtArr.includes(ext)) {
          throw new BadRequestException(
            `Invalid file type: ${file.originalname}. Only .jpg, .jpeg, .png are allowed.`,
          );
        }

        const imageUrl = await this.firebaseService.uploadImage(file, 'images');
        imageUrls.push(imageUrl); // Collect uploaded image URLs
      }

      return {
        message: 'Images were uploaded successfully!',
        imageUrls,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Image upload failed!');
    }
  }

  // Only handle uploading jpeg/png files with the maximum size of 5MB
  @Post('upload/image')
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
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
        imageUrl,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Image upload failed!');
    }
  }
}
