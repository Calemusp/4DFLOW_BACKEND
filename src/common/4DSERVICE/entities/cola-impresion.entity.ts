import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'COLA_IMPRESION' })
export class CatRol {
  @PrimaryColumn({ name: 'Id', type: 'int', })
  Id: number;

  @Column({ name: 'Ticket', type: 'int' })
  Ticket: number;

  @Column({ name: 'Fecha', type: 'datetime'})
  date: Date;

  static readonly Columns = {
    ID: 'Id',
  } as const;
}