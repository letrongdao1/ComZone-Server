import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { FirebaseModule } from './firebase.module';

@Module({
  imports: [FirebaseModule, MulterModule.register({ dest: './uploads' })],
  providers: [],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
