import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'TEMP_PACIENTES_IGSS', schema: 'dbo' })
export class TEMP_PACIENTES_IGSS {
  @Column({ name: 'id_Orden', type: 'varchar', length: 30, nullable: true })
  orderId!: string | null;

  @PrimaryColumn({ name: 'afiliacion', type: 'varchar', length: 25 })
  affiliation!: string;

  @Column({ name: 'foto', type: 'varbinary', length: 'max', nullable: true })
  photo!: Buffer | null;

  @PrimaryColumn({ name: 'fecha', type: 'datetime' })
  date!: Date;
}
