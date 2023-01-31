import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Workspaces } from '../entities/Workspaces';
import { Channels } from '../entities/Channels';
import { WorkspaceMembers } from '../entities/WorkspaceMembers';
import { ChannelMembers } from '../entities/ChannelMembers';
import { Users } from '../entities/Users';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspaces)
    private workspacesRepository: Repository<Workspaces>,
    @InjectRepository(Channels)
    private channelsRepository: Repository<Channels>,
    @InjectRepository(WorkspaceMembers)
    private workspaceMembersRepository: Repository<WorkspaceMembers>,
    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private dataSource: DataSource,
  ) {}

  async findMyWorkspaces(myId: number) {
    return this.workspacesRepository.find({
      where: {
        WorkspaceMembers: [{ UserId: myId }],
      },
    });
  }

  async createWorkspace(createWorkspaceDto, myId: number) {
    const { name, url } = createWorkspaceDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const workspace = this.workspacesRepository.create({
        name,
        url,
        OwnerId: myId,
      });
      const returned = await this.workspacesRepository.save(workspace);
      const workspaceMember = new WorkspaceMembers();
      workspaceMember.UserId = myId;
      workspaceMember.WorkspaceId = returned.id;
      await this.workspaceMembersRepository.save(workspaceMember);
      const channel = new Channels();
      channel.name = '일반';
      channel.WorkspaceId = returned.id;
      const channelReturned = await this.channelsRepository.save(channel);
      const channelMember = new ChannelMembers();
      channelMember.UserId = myId;
      channelMember.ChannelId = channelReturned.id;
      await this.channelMembersRepository.save(channelMember);
      await queryRunner.commitTransaction();
      return returned;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getWorkspaceMembers(url: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.WorkspaceMembers', 'members')
      .innerJoin('members.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .getMany();
  }

  async createWorkspaceMembers(url, email) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const workspace = await queryRunner.manager
      .getRepository(Workspaces)
      .findOne({
        where: { url },
        relations: ['Channels'],
      });
    const user = await queryRunner.manager
      .getRepository(Users)
      .findOne({ where: { email } });
    const workspaceMember = await queryRunner.manager
      .getRepository(WorkspaceMembers)
      .findOne({
        where: { WorkspaceId: workspace.id, UserId: user.id },
      });
    if (workspaceMember) {
      throw new ForbiddenException();
    }
    try {
      const workspaceMember = new WorkspaceMembers();
      workspaceMember.WorkspaceId = workspace.id;
      workspaceMember.UserId = user.id;
      await this.workspaceMembersRepository.save(workspaceMember);
      const channelMember = new ChannelMembers();
      channelMember.ChannelId = workspace.Channels.find(
        (v) => v.name === '일반',
      ).id;
      channelMember.UserId = user.id;
      await this.channelMembersRepository.save(channelMember);
      await queryRunner.commitTransaction();
      return workspaceMember;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getWorkspaceMember(url: string, id: number) {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .innerJoin('user.Workspaces', 'workspaces', 'workspaces.url = :url', {
        url,
      })
      .getOne();
  }
}
