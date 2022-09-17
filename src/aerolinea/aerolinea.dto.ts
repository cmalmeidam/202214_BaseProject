import { IsString, IsNotEmpty } from 'class-validator';

export class AerolineaDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly descripcion: string;

  @IsNotEmpty()
  readonly fechaFundacion: Date;

  @IsString()
  @IsNotEmpty()
  readonly paginaWeb: string;
}
