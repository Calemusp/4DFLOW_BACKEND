import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: '_CITA' })
export class CITA {
  @PrimaryGeneratedColumn({ name: 'cita', type: 'int' })
  appointmentId: number;

  @Column({ name: 'fechaCreacion', type: 'datetime', nullable: true })
  createdAt: Date | null;

  @Column({ name: 'fechaCita', type: 'datetime', nullable: true })
  appointmentDate: Date | null;

  @Column({ name: 'tipoOrden', type: 'varchar', length: 3, nullable: true })
  orderType: string | null;

  @Column({ name: 'orden', type: 'varchar', length: 15, nullable: true })
  orderNumber: string | null;

  @Column({ name: 'vigente', type: 'bit', nullable: true })
  isActive: boolean | null;

  @Column({ name: 'asignada', type: 'bit', nullable: true })
  isAssigned: boolean | null;

  @Column({ name: 'telefono', type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ name: 'direccion', type: 'varchar', length: 200, nullable: true })
  address: string | null;

  @Column({
    name: 'UsuarioCreacion',
    type: 'varchar',
    length: 25,
    nullable: true,
  })
  createdBy: string | null;

  @Column({ name: 'idCitaGrupo', type: 'varchar', length: 25, nullable: true })
  appointmentGroupId: string | null;

  @Column({
    name: 'usuarioCancela',
    type: 'varchar',
    length: 25,
    nullable: true,
  })
  cancelledBy: string | null;

  @Column({ name: 'fechaCancela', type: 'datetime', nullable: true })
  cancelledAt: Date | null;

  @Column({
    name: 'motivoCancela',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  cancellationReason: string | null;

  @Column({
    name: 'referenciaCita',
    type: 'varchar',
    length: 25,
    nullable: true,
  })
  appointmentReference: string | null;

  @Column({ name: 'fechaConversion', type: 'datetime', nullable: true })
  convertedAt: Date | null;

  static readonly Columns = {
    ID: 'cita',
  } as const;
}
