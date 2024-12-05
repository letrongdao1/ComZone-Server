import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { ExchangePost } from 'src/entities/exchange-post.entity';
import { Not, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateExchangePostDTO } from './dto/post.dto';
import { ExchangePostStatusEnum } from './dto/post-status.enum';
import { Exchange } from 'src/entities/exchange.entity';
import { ExchangeStatusEnum } from '../exchanges/dto/exchange-status-enum';

@Injectable()
export class ExchangePostsService extends BaseService<ExchangePost> {
  constructor(
    @InjectRepository(ExchangePost)
    private readonly postsRepository: Repository<ExchangePost>,
    @InjectRepository(Exchange)
    private readonly exchangesRepository: Repository<Exchange>,

    private readonly usersService: UsersService,
  ) {
    super(postsRepository);
  }

  async createNewPost(userId: string, dto: CreateExchangePostDTO) {
    const user = await this.usersService.getOne(userId);

    const newPost = this.postsRepository.create({
      user,
      ...dto,
    });
    return await this.postsRepository.save(newPost);
  }

  shuffle(array: any[]) {
    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async getAvailablePosts(userId?: string) {
    const posts = await this.postsRepository.find({
      where: { status: ExchangePostStatusEnum.AVAILABLE },
      order: { createdAt: 'DESC' },
    });

    const newList = await Promise.all(
      posts.map(async (post) => {
        const mine = userId ? post.user.id === userId : false;
        const alreadyExchange = await this.exchangesRepository.findOne({
          where: {
            post: { id: post.id },
            requestUser: { id: userId },
            status: Not(ExchangeStatusEnum.REJECTED),
          },
        });

        return {
          ...post,
          mine,
          already: userId ? alreadyExchange !== null : false,
          alreadyExchange,
        };
      }),
    );

    return newList;
  }

  async getSearchedPosts(key: string) {
    if (!key || key.length === 0) return await this.getAvailablePosts();

    return await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('LOWER(post.postContent) LIKE :key AND post.status = :status', {
        key: `%${key.toLowerCase()}%`,
        status: ExchangePostStatusEnum.AVAILABLE,
      })
      .orderBy('post.updatedAt')
      .getMany();
  }

  async getSomeShortPosts() {
    return await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('LENGTH(post.postContent) < 100')
      .take(5)
      .getMany();
  }

  async hidePost(postId: string) {
    return await this.postsRepository
      .update(postId, {
        status: ExchangePostStatusEnum.UNAVAILABLE,
      })
      .then(() => this.getOne(postId));
  }

  async revealPost(postId: string, dto: CreateExchangePostDTO) {
    const post = await this.getOne(postId);
    if (!post) throw new NotFoundException('Exchange post cannot be found!');

    return await this.postsRepository
      .update(postId, {
        status: ExchangePostStatusEnum.AVAILABLE,
        postContent: dto.postContent || post.postContent,
        images: dto.images || post.images,
      })
      .then(() => this.getOne(postId));
  }

  async updatePostStatus(postId: string, status: ExchangePostStatusEnum) {
    return await this.postsRepository
      .update(postId, {
        status,
      })
      .then(() => this.getOne(postId));
  }
}
