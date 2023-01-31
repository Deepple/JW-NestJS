import { PickType } from '@nestjs/swagger';
import { Workspaces } from '../../entities/Workspaces';

export class CreateWorkspaceDto extends PickType(Workspaces, ['name', 'url']) {}
