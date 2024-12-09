// src/announcement/announcement.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { Announcement } from '../../entities/announcement.entity';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  @Get('/auction/:auctionId/unread')
  async getUnreadAnnouncementForAuction(
    @Req() req: any,
    @Param('auctionId') auctionId: string,
  ): Promise<Announcement | null> {
    return this.announcementService.getUnreadAnnouncement(
      req.user.id,
      auctionId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mark-all-read')
  async markAllAsReadByType(
    @Req() req: any,
    @Query('type') type?: string, // Optional type parameter
  ): Promise<{ message: string }> {
    await this.announcementService.markAllAsRead(req.user.id, type);
    return { message: 'Announcements marked as read by type' };
  }
  // @UseGuards(JwtAuthGuard)
  // @Patch('mark-all-read/')
  // async markAllAsRead(@Req() req: any): Promise<{ message: string }> {
  //   await this.announcementService.markAllAsRead(req.user.id);
  //   return { message: 'All announcements marked as read' };
  // }
  @UseGuards(JwtAuthGuard)
  @Get('/user')
  async findAnnouncementsByUser(@Req() req: any) {
    return this.announcementService.findByUserId(req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/user/unread-count')
  async getUnreadCount(@Req() req: any) {
    const count = await this.announcementService.countUnreadAnnouncements(
      req.user.id,
    );
    return count;
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
  @UseGuards(JwtAuthGuard)
  @Post(':announcementId/read/')
  async markAnnouncementAsRead(
    @Req() req: any,
    @Param('announcementId') announcementId: string,
  ): Promise<void> {
    return this.announcementService.markAsRead(announcementId, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.announcementService.remove(id);
  }
}
