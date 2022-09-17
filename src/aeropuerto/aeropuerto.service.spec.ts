import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AeropuertoEntity } from './aeropuerto.entity';
import { AeropuertoService } from './aeropuerto.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('AeropuertoService', () => {
  let service: AeropuertoService;
  let repository: Repository<AeropuertoEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AeropuertoService],
    }).compile();

    service = module.get<AeropuertoService>(AeropuertoService);
    repository = module.get<Repository<AeropuertoEntity>>(
      getRepositoryToken(AeropuertoEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
