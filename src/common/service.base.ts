import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { HttpException } from '@nestjs/common';
import { BaseEntity } from './entity.base';

export class BaseService<Entity extends BaseEntity> {
  constructor(protected repository: Repository<Entity>) {}

  getAll(): Promise<Entity[]> {
    return this.repository.find();
  }

  getAllWithDeleted(): Promise<Entity[]> {
    return this.repository.find({ withDeleted: true });
  }

  getOne(id: string): Promise<Entity> {
    if (!isUUID(id)) throw new HttpException(`${id} is not a valid ID!`, 400);
    return this.repository.findOne({ where: { id: id as any } });
  }

  create(entity: any): Promise<Entity> {
    return this.repository.save(entity);
  }

  async update(id: string, entity: any): Promise<Entity> {
    if (!isUUID(id)) throw new HttpException(`'${id}' is not a valid ID!`, 400);
    return this.repository.update(id, entity).then(() => this.getOne(id));
  }

  delete(id: string): Promise<any> {
    if (!isUUID(id)) throw new HttpException(`${id} is not a valid ID!`, 400);
    return this.repository.delete(id);
  }

  softDelete(id: string): Promise<any> {
    if (!isUUID(id)) throw new HttpException(`${id} is not a valid ID!`, 400);
    return this.repository.softDelete(id);
  }

  restore(id: string): Promise<any> {
    if (!isUUID(id)) throw new HttpException(`${id} is not a valid ID!`, 400);
    return this.repository.restore(id);
  }
}
