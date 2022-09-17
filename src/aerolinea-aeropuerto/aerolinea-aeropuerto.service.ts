import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AerolineaEntity } from '../aerolinea/aerolinea.entity';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class AerolineaAeropuertoService {
  constructor(
    @InjectRepository(AerolineaEntity)
    private readonly aerolineaRepository: Repository<AerolineaEntity>,

    @InjectRepository(AeropuertoEntity)
    private readonly aeropuertoRepository: Repository<AeropuertoEntity>,
  ) {}

  async addAirportToAirline(
    aerolineaId: string,
    aeropuertoId: string,
  ): Promise<AerolineaEntity> {
    const aeropuerto: AeropuertoEntity =
      await this.aeropuertoRepository.findOne({
        where: { id: aeropuertoId },
        relations: ['aerolineas'],
      });
    if (!aeropuerto)
      throw new BusinessLogicException(
        'El aeropuerto con el id no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({
      where: { id: aerolineaId },
      relations: ['aeropuertos'],
    });
    if (!aerolinea)
      throw new BusinessLogicException(
        'La aerolinea con el id no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    aerolinea.aeropuertos = [...aerolinea.aeropuertos, aeropuerto];
    return await this.aerolineaRepository.save(aerolinea);
  }

  async findAirportsFromAirline(
    aerolineaId: string,
  ): Promise<AeropuertoEntity[]> {
    const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({
      where: { id: aerolineaId },
      relations: ['aeropuertos'],
    });
    if (!aerolinea)
      throw new BusinessLogicException(
        'La aerolinea con el id no fue encontrado',
        BusinessError.NOT_FOUND,
      );

    return aerolinea.aeropuertos;
  }

  async findAirportFromAirline(
    aerolineaId: string,
    aeropuertoId: string,
  ): Promise<AeropuertoEntity> {
    const aeropuerto: AeropuertoEntity =
      await this.aeropuertoRepository.findOne({
        where: { id: aeropuertoId },
        relations: ['aerolineas'],
      });
    if (!aeropuerto)
      throw new BusinessLogicException(
        'El aeropuerto con el id no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({
      where: { id: aerolineaId },
      relations: ['aeropuertos'],
    });
    if (!aerolinea)
      throw new BusinessLogicException(
        'La aerolinea con el id no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    const aerolineaAeropuerto: AeropuertoEntity = aerolinea.aeropuertos.find(
      (e) => e.id === aeropuerto.id,
    );
    if (!aerolineaAeropuerto)
      throw new BusinessLogicException(
        'El aeropuerto con el id no esta asociado a la aerolinea',
        BusinessError.PRECONDITION_FAILED,
      );
    return aerolineaAeropuerto;
  }

  async updateAirportsFromAirline(
    aerolineaId: string,
    aeropuertos: AeropuertoEntity[],
  ): Promise<AerolineaEntity> {
    const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({
      where: { id: aerolineaId },
      relations: ['aeropuertos'],
    });
    if (!aerolinea)
      throw new BusinessLogicException(
        'La aerolinea con el id no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    for (let i = 0; i < aeropuertos.length; i++) {
      const aeropuerto: AeropuertoEntity =
        await this.aeropuertoRepository.findOne({
          where: { id: aeropuertos[i].id },
          relations: ['aerolineas'],
        });
      if (!aeropuerto)
        throw new BusinessLogicException(
          'El aeropuerto con el id no fue encontrado',
          BusinessError.NOT_FOUND,
        );
    }
    aerolinea.aeropuertos = aeropuertos;
    return await this.aerolineaRepository.save(aerolinea);
  }

  async deleteAirportFromAirline(aerolineaId: string, aeropuertoId: string) {
    const aeropuerto: AeropuertoEntity =
      await this.aeropuertoRepository.findOne({
        where: { id: aeropuertoId },
        relations: ['aerolineas'],
      });
    if (!aeropuerto)
      throw new BusinessLogicException(
        'El aeropuerto con el id no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({
      where: { id: aerolineaId },
      relations: ['aeropuertos'],
    });
    if (!aerolinea)
      throw new BusinessLogicException(
        'La aerolinea con el id no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    const aerolineaAeropuerto: AeropuertoEntity = aerolinea.aeropuertos.find(
      (e) => e.id === aeropuerto.id,
    );
    if (!aerolineaAeropuerto)
      throw new BusinessLogicException(
        'El aeropuerto con el id no esta asociado a la aerolinea',
        BusinessError.PRECONDITION_FAILED,
      );
    aerolinea.aeropuertos = aerolinea.aeropuertos.filter(
      (e) => e.id !== aeropuertoId,
    );
    await this.aerolineaRepository.save(aerolinea);
  }
}
