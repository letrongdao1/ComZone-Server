// src/announcement/announcement.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { Announcement } from '../../entities/announcement.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  async create(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<Announcement> {
    return this.announcementService.createAnnouncement(createAnnouncementDto);
  }

  @Get()
  async findAll(): Promise<Announcement[]> {
    return this.announcementService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Announcement> {
    return this.announcementService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ): Promise<Announcement> {
    return this.announcementService.update(id, updateAnnouncementDto);
  }

  @Post(':announcementId/read/:userId')
  async markAnnouncementAsRead(
    @Param('userId') userId: string,
    @Param('announcementId') announcementId: string,
  ): Promise<void> {
    return this.announcementService.markAsRead(userId, announcementId);
  }
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.announcementService.remove(id);
  }
}
