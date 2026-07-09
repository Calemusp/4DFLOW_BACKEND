import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: '_CAT_USUARIO' })
export class CAT_USUARIO {
  @PrimaryColumn({ name: 'usuario', type: 'varchar', length: 25 })
  usuario!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100, nullable: true })
  nombre!: string | null;

  @Column({ name: 'password', type: 'varchar', length: 50, nullable: true })
  password!: string | null;

  @Column({ name: 'vigente', type: 'bit', nullable: true })
  vigente!: boolean | null;
}
