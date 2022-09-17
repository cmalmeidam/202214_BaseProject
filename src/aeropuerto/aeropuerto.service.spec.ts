import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AeropuertoEntity } from './aeropuerto.entity';
import { AeropuertoService } from './aeropuerto.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

describe('AeropuertoService', () => {
  let service: AeropuertoService;
  let repository: Repository<AeropuertoEntity>;
  let aeropuertoList: AeropuertoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AeropuertoService],
    }).compile();

    service = module.get<AeropuertoService>(AeropuertoService);
    repository = module.get<Repository<AeropuertoEntity>>(
      getRepositoryToken(AeropuertoEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    aeropuertoList = [];
    for (let i = 0; i < 5; i++) {
      const aeropuerto: AeropuertoEntity = await repository.save({
        nombre: faker.company.name(),
        codigo: faker.random.alpha(3),
        pais: faker.address.country(),
        ciudad: faker.address.city(),
      });
      aeropuertoList.push(aeropuerto);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll debe retornar todos los aeropuertos', async () => {
    const aeropuertos: AeropuertoEntity[] = await service.findAll();
    expect(aeropuertos).not.toBeNull();
    expect(aeropuertos).toHaveLength(aeropuertoList.length);
  });

  it('findOne debe retornar un aeropuerto por id', async () => {
    const storedAeropuerto: AeropuertoEntity = aeropuertoList[0];
    const aeropuerto: AeropuertoEntity = await service.findOne(
      storedAeropuerto.id,
    );
    expect(aeropuerto).not.toBeNull();
    expect(aeropuerto.nombre).toEqual(storedAeropuerto.nombre);
    expect(aeropuerto.codigo).toEqual(storedAeropuerto.codigo);
    expect(aeropuerto.pais).toEqual(storedAeropuerto.pais);
    expect(aeropuerto.ciudad).toEqual(storedAeropuerto.ciudad);
  });

  it('findOne debe lanzar una exepcion por un aeropuerto invalido', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'El aeropuerto con el id no ha sido encontrado',
    );
  });

  it('create debe retornar un aeropuerto', async () => {
    const aeropuerto: AeropuertoEntity = {
      id: '',
      nombre: faker.company.name(),
      codigo: faker.random.alpha(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
      aerolineas: [],
    };
    const newAeropuerto: AeropuertoEntity = await service.create(aeropuerto);
    expect(newAeropuerto).not.toBeNull();
    const storedAeropuerto: AeropuertoEntity = await repository.findOne({
      where: { id: newAeropuerto.id },
    });
    expect(storedAeropuerto).not.toBeNull();
    expect(storedAeropuerto.nombre).toEqual(newAeropuerto.nombre);
    expect(storedAeropuerto.codigo).toEqual(newAeropuerto.codigo);
    expect(storedAeropuerto.pais).toEqual(newAeropuerto.pais);
    expect(storedAeropuerto.ciudad).toEqual(newAeropuerto.ciudad);
  });

  it('create debe lanzar una excepcion por codigo invalido', async () => {
    const aeropuerto: AeropuertoEntity = {
      id: '',
      nombre: faker.company.name(),
      codigo: faker.random.alpha(5),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
      aerolineas: [],
    };
    await expect(() => service.create(aeropuerto)).rejects.toHaveProperty(
      'message',
      'El codigo unicamente puede tener 3 caracteres',
    );
  });

  it('update debe modificar un aeropuerto', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertoList[0];
    aeropuerto.nombre = 'Nuevo nombre';
    aeropuerto.codigo = 'MDR';
    const updatedAeropuerto: AeropuertoEntity = await service.update(
      aeropuerto.id,
      aeropuerto,
    );
    expect(updatedAeropuerto).not.toBeNull();
    const storedAeropuerto: AeropuertoEntity = await repository.findOne({
      where: { id: aeropuerto.id },
    });
    expect(storedAeropuerto).not.toBeNull();
    expect(storedAeropuerto.nombre).toEqual(aeropuerto.nombre);
    expect(storedAeropuerto.codigo).toEqual(aeropuerto.codigo);
  });

  it('update debe lanzar una excepcion por codigo invalido', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertoList[0];
    aeropuerto.nombre = 'Nuevo nombre';
    aeropuerto.codigo = 'MDRL';
    await expect(() =>
      service.update(aeropuerto.id, aeropuerto),
    ).rejects.toHaveProperty(
      'message',
      'El codigo unicamente puede tener 3 caracteres',
    );
  });

  it('update debe lanzar una excepcion por aerolinea invalida', async () => {
    let aeropuerto: AeropuertoEntity = aeropuertoList[0];
    aeropuerto = {
      ...aeropuerto,
      nombre: 'Nuevo nombre',
      codigo: 'MDR',
    };
    await expect(() => service.update('0', aeropuerto)).rejects.toHaveProperty(
      'message',
      'El aeropuerto con el id no ha sido encontrado',
    );
  });

  it('delete debe eliminar un aeropuerto', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertoList[0];
    await service.delete(aeropuerto.id);
    const deletedAeropuerto: AeropuertoEntity = await repository.findOne({
      where: { id: aeropuerto.id },
    });
    expect(deletedAeropuerto).toBeNull();
  });

  it('delete debe lanzar una excepcion por aeropuerto invalido', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'El aeropuerto con el id no ha sido encontrado',
    );
  });
});
