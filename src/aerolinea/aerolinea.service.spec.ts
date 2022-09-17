import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AerolineaEntity } from './aerolinea.entity';
import { AerolineaService } from './aerolinea.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('AerolineaService', () => {
  let service: AerolineaService;
  let repository: Repository<AerolineaEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AerolineaService],
    }).compile();

    service = module.get<AerolineaService>(AerolineaService);
    repository = module.get<Repository<AerolineaEntity>>(
      getRepositoryToken(AerolineaEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
