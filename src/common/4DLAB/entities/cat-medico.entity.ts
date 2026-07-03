import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: '_CAT_MEDICO' })
export class CAT_MEDICO {
  @PrimaryColumn({ name: 'medico', type: 'varchar', length: 25 })
  doctorCode: string;

  @Column({ name: 'nombre', type: 'varchar', length: 200, nullable: true })
  name: string | null;
}
