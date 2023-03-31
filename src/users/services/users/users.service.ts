import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/typeorm/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUpdateUserProfileParams,
  CreateUserParams,
  CreateUserPostParams,
  UpdateUserParams,
} from 'src/users/utils/type';
import { CreateUserProfileDto } from 'src/users/dtos/CreateUserProfile.dto';
import { Profile } from 'src/typeorm/entities/Profile';
import { PostUser } from 'src/typeorm/entities/Post';

// service viet logic

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private useResponsitory: Repository<User>,
    @InjectRepository(Profile) private profileResponsitory: Repository<Profile>,
    @InjectRepository(PostUser) private postResponsitory: Repository<PostUser>,
  ) {}

  findUsers() {
    return this.useResponsitory.find({ relations: ['profile', 'posts'] });
  }

  createUser(userDetails: CreateUserParams) {
    const newUser = this.useResponsitory.create({
      ...userDetails,
      createAt: new Date(),
    });
    this.useResponsitory.save(newUser);
  }

  updateUser(id: number, updateUserDetails: UpdateUserParams) {
    return this.useResponsitory.update(
      {
        id,
      },
      {
        ...updateUserDetails,
      },
    );
  }

  deleteUser(id: number) {
    return this.useResponsitory.delete({ id });
  }

  async createUserProfile(
    id: number,
    createUserProfileDetail: CreateUpdateUserProfileParams,
  ) {
    const user = await this.useResponsitory.findOneBy({ id });
    if (!user)
      throw new HttpException(
        'User not found. Can not create profile!',
        HttpStatus.BAD_REQUEST,
      );

    const newProfile = this.profileResponsitory.create(createUserProfileDetail);
    const savedProfile = await this.profileResponsitory.save(newProfile);

    user.profile = savedProfile;
    return this.useResponsitory.save(user);
  }

  async createUserPost(id: number, createUserPostDetail: CreateUserPostParams) {
    const user = await this.useResponsitory.findOneBy({ id });
    if (!user)
      throw new HttpException(
        'User not found. Can not create profile!',
        HttpStatus.BAD_REQUEST,
      );
    const newPost = this.postResponsitory.create({
      ...createUserPostDetail,
      user,
    });
    return this.postResponsitory.save(newPost);
  }
}
