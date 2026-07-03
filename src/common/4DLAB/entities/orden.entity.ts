import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: '_ORDEN' })
export class ORDEN {
  @PrimaryColumn({ name: 'Orden', type: 'varchar', length: 15 })
  orderNumber: string;

  @PrimaryColumn({ name: 'tipoOrden', type: 'varchar', length: 3 })
  orderType: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100, nullable: true })
  firstName: string | null;

  @Column({ name: 'primerApellido', type: 'varchar', length: 100, nullable: true })
  firstLastName: string | null;

  @Column({ name: 'segundoApellido', type: 'varchar', length: 100, nullable: true })
  secondLastName: string | null;

  @Column({ name: 'paciente', type: 'varchar', length: 25, nullable: true })
  patientId: string | null;

  @Column({ name: 'fechaNacimiento', type: 'datetime', nullable: true })
  birthDate: Date | null;

  @Column({ name: 'sexo', type: 'varchar', length: 1, nullable: true })
  gender: string | null;

  @Column({ name: 'telefono', type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ name: 'codigoMedico', type: 'varchar', length: 25, nullable: true })
  doctorCode: string | null;
}
