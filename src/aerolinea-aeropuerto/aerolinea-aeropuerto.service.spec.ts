import { Test, TestingModule } from '@nestjs/testing';
import { AerolineaEntity } from '../aerolinea/aerolinea.entity';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AerolineaAeropuertoService } from './aerolinea-aeropuerto.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('AerolineaAeropuertoService', () => {
  let service: AerolineaAeropuertoService;
  let aerolineaRepository: Repository<AerolineaEntity>;
  let aeropuertoRepository: Repository<AeropuertoEntity>;
  let aerolinea: AerolineaEntity;
  let aeropuertosList: AeropuertoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AerolineaAeropuertoService],
    }).compile();

    service = module.get<AerolineaAeropuertoService>(
      AerolineaAeropuertoService,
    );
    aerolineaRepository = module.get<Repository<AerolineaEntity>>(
      getRepositoryToken(AerolineaEntity),
    );
    aeropuertoRepository = module.get<Repository<AeropuertoEntity>>(
      getRepositoryToken(AeropuertoEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    aerolineaRepository.clear();
    aeropuertoRepository.clear();
    aeropuertosList = [];
    for (let i = 0; i < 5; i++) {
      const artwork: AeropuertoEntity = await aeropuertoRepository.save({
        nombre: faker.company.name(),
        codigo: faker.random.alpha(3),
        pais: faker.address.country(),
        ciudad: faker.address.city(),
      });
      aeropuertosList.push(artwork);
    }
    aerolinea = await aerolineaRepository.save({
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fechaFundacion: faker.date.between(
        '2010-01-01T00:00:00.000Z',
        '2021-01-01T00:00:00.000Z',
      ),
      paginaWeb: faker.internet.url(),
      aeropuertos: aeropuertosList,
    });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addAirportToAirline debe adicionar un aeropuerto a una aerolinea', async () => {
    const newAeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.random.alpha(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
    });
    const newAerolinea: AerolineaEntity = await aerolineaRepository.save({
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fechaFundacion: faker.date.between(
        '2010-01-01T00:00:00.000Z',
        '2021-01-01T00:00:00.000Z',
      ),
      paginaWeb: faker.internet.url(),
    });
    const result: AerolineaEntity = await service.addAirportToAirline(
      newAerolinea.id,
      newAeropuerto.id,
    );
    expect(result.aeropuertos.length).toBe(1);
    expect(result.aeropuertos[0]).not.toBeNull();
    expect(result.aeropuertos[0].nombre).toBe(newAeropuerto.nombre);
    expect(result.aeropuertos[0].codigo).toBe(newAeropuerto.codigo);
    expect(result.aeropuertos[0].pais).toBe(newAeropuerto.pais);
    expect(result.aeropuertos[0].ciudad).toBe(newAeropuerto.ciudad);
  });

  it('addAirportToAirline debe lanzar una excepcion por aeropuerto invalido', async () => {
    const newAerolinea: AerolineaEntity = await aerolineaRepository.save({
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fechaFundacion: faker.date.between(
        '2010-01-01T00:00:00.000Z',
        '2021-01-01T00:00:00.000Z',
      ),
      paginaWeb: faker.internet.url(),
    });
    await expect(() =>
      service.addAirportToAirline(newAerolinea.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'El aeropuerto con el id no fue encontrado',
    );
  });

  it('addAirportToAirline debe lanzar una excepcion por aerolinea invalida', async () => {
    const newAeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.random.alpha(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
    });
    await expect(() =>
      service.addAirportToAirline('0', newAeropuerto.id),
    ).rejects.toHaveProperty(
      'message',
      'La aerolinea con el id no fue encontrado',
    );
  });

  it('findAirportsFromAirline debe retornar aeropuertos por aerolinea', async () => {
    const aeropuertos: AeropuertoEntity[] =
      await service.findAirportsFromAirline(aerolinea.id);
    expect(aeropuertos.length).toBe(5);
  });

  it('findAirportsFromAirline debe lanzar una excepcion por aerolinea invalida', async () => {
    await expect(() =>
      service.findAirportsFromAirline('0'),
    ).rejects.toHaveProperty(
      'message',
      'La aerolinea con el id no fue encontrado',
    );
  });

  it('findAirportFromAirline debe retornar aeropuerto para una aerolinea', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    const storedAeropuerto: AeropuertoEntity =
      await service.findAirportFromAirline(aerolinea.id, aeropuerto.id);
    expect(storedAeropuerto).not.toBeNull();
    expect(storedAeropuerto.nombre).toBe(aeropuerto.nombre);
    expect(storedAeropuerto.codigo).toBe(aeropuerto.codigo);
    expect(storedAeropuerto.pais).toBe(aeropuerto.pais);
    expect(storedAeropuerto.ciudad).toBe(aeropuerto.ciudad);
  });

  it('findAirportFromAirline debe lanzar una excepcion por aeropuerto invalido', async () => {
    await expect(() =>
      service.findAirportFromAirline(aerolinea.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'El aeropuerto con el id no fue encontrado',
    );
  });

  it('findAirportFromAirline debe lanzar una excepcion por aerolinea invalida', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    await expect(() =>
      service.findAirportFromAirline('0', aeropuerto.id),
    ).rejects.toHaveProperty(
      'message',
      'La aerolinea con el id no fue encontrado',
    );
  });

  it('findAirportFromAirline debe lanzar una excepcion aeropuerto no asociada a una aerolinea', async () => {
    const newAeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.random.alpha(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
    });
    await expect(() =>
      service.findAirportFromAirline(aerolinea.id, newAeropuerto.id),
    ).rejects.toHaveProperty(
      'message',
      'El aeropuerto con el id no esta asociado a la aerolinea',
    );
  });

  it('updateAirportsFromAirline debe actualizar lista de aeropuertos para una aerolinea', async () => {
    const newAeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.random.alpha(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
    });
    const updatedAerolinea: AerolineaEntity =
      await service.updateAirportsFromAirline(aerolinea.id, [newAeropuerto]);
    expect(updatedAerolinea.aeropuertos.length).toBe(1);
    expect(updatedAerolinea.aeropuertos[0].nombre).toBe(newAeropuerto.nombre);
    expect(updatedAerolinea.aeropuertos[0].codigo).toBe(newAeropuerto.codigo);
    expect(updatedAerolinea.aeropuertos[0].pais).toBe(newAeropuerto.pais);
    expect(updatedAerolinea.aeropuertos[0].ciudad).toBe(newAeropuerto.ciudad);
  });

  it('updateAirportsFromAirline debe lanzar una excepcion por aerolinea invalida', async () => {
    const newAeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.random.alpha(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
    });
    await expect(() =>
      service.updateAirportsFromAirline('0', [newAeropuerto]),
    ).rejects.toHaveProperty(
      'message',
      'La aerolinea con el id no fue encontrado',
    );
  });

  it('updateAirportsFromAirline debe lanzar una excepcion por aeropuerto invalido', async () => {
    const newAeropuerto: AeropuertoEntity = aeropuertosList[0];
    newAeropuerto.id = '0';
    await expect(() =>
      service.updateAirportsFromAirline(aerolinea.id, [newAeropuerto]),
    ).rejects.toHaveProperty(
      'message',
      'El aeropuerto con el id no fue encontrado',
    );
  });

  it('deleteAirportFromAirline debe eliminar un aeropuerto de una aerolinea', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    await service.deleteAirportFromAirline(aerolinea.id, aeropuerto.id);
    const storedAerolinea: AerolineaEntity = await aerolineaRepository.findOne({
      where: { id: aerolinea.id },
      relations: ['aeropuertos'],
    });
    const deletedAeropuerto: AeropuertoEntity =
      storedAerolinea.aeropuertos.find((a) => a.id === aeropuerto.id);
    expect(deletedAeropuerto).toBeUndefined();
  });

  it('deleteAirportFromAirline debe lanzar una excepcion por aeropuerto invalido', async () => {
    await expect(() =>
      service.deleteAirportFromAirline(aerolinea.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'El aeropuerto con el id no fue encontrado',
    );
  });

  it('deleteAirportFromAirline debe lanzar una excepcion por aerolinea invalida', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    await expect(() =>
      service.deleteAirportFromAirline('0', aeropuerto.id),
    ).rejects.toHaveProperty(
      'message',
      'La aerolinea con el id no fue encontrado',
    );
  });

  it('deleteAirportFromAirline debe lanzar una excepcion aeropuerto no asociada a una aerolinea', async () => {
    const newAeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.random.alpha(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
    });
    await expect(() =>
      service.deleteAirportFromAirline(aerolinea.id, newAeropuerto.id),
    ).rejects.toHaveProperty(
      'message',
      'El aeropuerto con el id no esta asociado a la aerolinea',
    );
  });
});
