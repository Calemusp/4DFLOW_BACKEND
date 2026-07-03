import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'VENTANILLA' })
export class VENTANILLA {
  @PrimaryColumn({ name: 'Ventanilla', type: 'int' })
  ventanilla!: number;

  @Column({ name: 'cola', type: 'int', nullable: true })
  cola!: number | null;

  @Column({ name: 'Nombre', type: 'varchar', length: 50, nullable: true })
  name!: string | null;

  @Column({ name: 'Abreviatura', type: 'varchar', length: 15, nullable: true })
  abbreviation!: string | null;

  @Column({ name: 'Vigente', type: 'bit', nullable: true })
  isActive!: boolean | null;

  @Column({ name: 'TicketActual', type: 'int', nullable: true })
  currentTicket!: number | null;

  @Column({ name: 'Color', type: 'varchar', length: 25, nullable: true })
  color!: string | null;

  @Column({ name: 'parametros', type: 'varchar', length: 25, nullable: true })
  parameters!: string | null;

  @Column({ name: 'accesoWeb', type: 'bit', nullable: true })
  webAccess!: boolean | null;

  @Column({ name: 'impresora', type: 'varchar', length: 250, nullable: true })
  printer!: string | null;
}
