import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'TICKET' })
export class TICKET {
  @PrimaryGeneratedColumn({ name: 'Ticket', type: 'int' })
  Ticket!: number;

  @Column({ name: 'Servicio', type: 'int', nullable: true })
  serviceId!: number | null;

  @Column({ name: 'Serie', type: 'nchar', length: 1, nullable: true })
  series!: string | null;

  @Column({ name: 'Correlativo', type: 'int', nullable: true })
  sequentialNumber!: number | null;

  @Column({ name: 'Fecha', type: 'datetime', nullable: true })
  date!: Date | null;

  @Column({ name: 'Vigente', type: 'bit', nullable: true })
  isActive!: boolean | null;

  @Column({ name: 'Cancelado', type: 'bit', nullable: true })
  isCancelled!: boolean | null;

  @Column({ name: 'Etapa', type: 'int', nullable: true })
  stage!: number | null;

  @Column({ name: 'Especial', type: 'bit', nullable: true })
  isSpecial: boolean | null;

  @Column({ name: 'espera', type: 'bit', nullable: true })
  isWaiting: boolean | null;

  @Column({ name: 'tipoOrden', type: 'varchar', length: 3, nullable: true })
  orderType: string | null;

  @Column({ name: 'Orden', type: 'varchar', length: 15, nullable: true })
  orderNumber: string | null;

  @Column({ name: 'Paciente', type: 'varchar', length: 250, nullable: true })
  patient: string | null;

  static readonly Columns = {
    Ticket: 'Ticket',
  } as const;
}
