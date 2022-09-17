import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AerolineaEntity } from './aerolinea.entity';
import { AerolineaService } from './aerolinea.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

describe('AerolineaService', () => {
  let service: AerolineaService;
  let repository: Repository<AerolineaEntity>;
  let aerolineasList: AerolineaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AerolineaService],
    }).compile();

    service = module.get<AerolineaService>(AerolineaService);
    repository = module.get<Repository<AerolineaEntity>>(
      getRepositoryToken(AerolineaEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    aerolineasList = [];
    for (let i = 0; i < 5; i++) {
      const aerolinea: AerolineaEntity = await repository.save({
        nombre: faker.company.name(),
        descripcion: faker.lorem.sentence(),
        fechaFundacion: faker.date.between(
          '2010-01-01T00:00:00.000Z',
          '2021-01-01T00:00:00.000Z',
        ),
        paginaWeb: faker.internet.url(),
      });
      aerolineasList.push(aerolinea);
    }
  };
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll debe retornar todas las aerolineas', async () => {
    const aerolineas: AerolineaEntity[] = await service.findAll();
    expect(aerolineas).not.toBeNull();
    expect(aerolineas).toHaveLength(aerolineasList.length);
  });

  it('findOne debe retornar una aerolinea por id', async () => {
    const storedAerolinea: AerolineaEntity = aerolineasList[0];
    const aerolinea: AerolineaEntity = await service.findOne(
      storedAerolinea.id,
    );
    expect(aerolinea).not.toBeNull();
    expect(aerolinea.nombre).toEqual(storedAerolinea.nombre);
    expect(aerolinea.descripcion).toEqual(storedAerolinea.descripcion);
    expect(aerolinea.fechaFundacion).toEqual(storedAerolinea.fechaFundacion);
    expect(aerolinea.paginaWeb).toEqual(storedAerolinea.paginaWeb);
  });

  it('findOne debe lanzar una excepcion por una aerolinea invalida', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'La aerolinea con el id no ha sido encontrada',
    );
  });

  it('create debe retornar una aerolinea nueva', async () => {
    const aerolinea: AerolineaEntity = {
      id: '',
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fechaFundacion: faker.date.between(
        '2010-01-01T00:00:00.000Z',
        '2021-01-01T00:00:00.000Z',
      ),
      paginaWeb: faker.internet.url(),
      aeropuertos: [],
    };
    const newAerolinea: AerolineaEntity = await service.create(aerolinea);
    expect(aerolinea).not.toBeNull();
    const storedAerolinea: AerolineaEntity = await repository.findOne({
      where: { id: newAerolinea.id },
    });
    expect(storedAerolinea).not.toBeNull();
    expect(storedAerolinea.nombre).toEqual(newAerolinea.nombre);
    expect(storedAerolinea.descripcion).toEqual(newAerolinea.descripcion);
    expect(storedAerolinea.fechaFundacion).toEqual(newAerolinea.fechaFundacion);
    expect(storedAerolinea.paginaWeb).toEqual(newAerolinea.paginaWeb);
  });

  it('create debe lanzar una excepcion por fecha invalida', async () => {
    const aerolinea: AerolineaEntity = {
      id: '',
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fechaFundacion: faker.date.between(
        '2024-01-01T00:00:00.000Z',
        '2030-01-01T00:00:00.000Z',
      ),
      paginaWeb: faker.internet.url(),
      aeropuertos: [],
    };
    await expect(() => service.create(aerolinea)).rejects.toHaveProperty(
      'message',
      'La fecha de fundacion es mayor o igual a hoy',
    );
  });

  it('update debe modificar una aerolinea', async () => {
    const aerolinea: AerolineaEntity = aerolineasList[0];
    aerolinea.nombre = 'Nuevo nombre';
    aerolinea.descripcion = 'Nueva descripcion';
    const updatedAerolinea: AerolineaEntity = await service.update(
      aerolinea.id,
      aerolinea,
    );
    expect(updatedAerolinea).not.toBeNull();
    const storedAerolinea: AerolineaEntity = await repository.findOne({
      where: { id: aerolinea.id },
    });
    expect(storedAerolinea).not.toBeNull();
    expect(storedAerolinea.nombre).toEqual(aerolinea.nombre);
    expect(storedAerolinea.descripcion).toEqual(aerolinea.descripcion);
  });

  it('update debe lanzar una excepcion por fecha invalida', async () => {
    const aerolinea: AerolineaEntity = aerolineasList[0];
    aerolinea.fechaFundacion = faker.date.between(
      '2024-01-01T00:00:00.000Z',
      '2030-01-01T00:00:00.000Z',
    );
    await expect(() =>
      service.update(aerolinea.id, aerolinea),
    ).rejects.toHaveProperty(
      'message',
      'La fecha de fundacion es mayor o igual a hoy',
    );
  });

  it('update debe lanzar una excepcion por aerolinea invalida', async () => {
    let aerolinea: AerolineaEntity = aerolineasList[0];
    aerolinea = {
      ...aerolinea,
      nombre: 'Nuevo nombre',
      descripcion: 'Nueva descripcion',
    };
    await expect(() => service.update('0', aerolinea)).rejects.toHaveProperty(
      'message',
      'La aerolinea con el id no ha sido encontrada',
    );
  });

  it('delete debe eliminar un museo', async () => {
    const aerolinea: AerolineaEntity = aerolineasList[0];
    await service.delete(aerolinea.id);
    const deletedAerolinea: AerolineaEntity = await repository.findOne({
      where: { id: aerolinea.id },
    });
    expect(deletedAerolinea).toBeNull();
  });

  it('delete debe lanzar una excepcion por aerolinea invalida', async () => {
    const aerolinea: AerolineaEntity = aerolineasList[0];
    await service.delete(aerolinea.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'La aerolinea con el id no ha sido encontrada',
    );
  });
});
