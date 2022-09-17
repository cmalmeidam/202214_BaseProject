import { IsString, IsNotEmpty } from 'class-validator';

export class AeropuertoDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly codigo: string;

  @IsNotEmpty()
  readonly pais: string;

  @IsString()
  @IsNotEmpty()
  readonly ciudad: string;
}
