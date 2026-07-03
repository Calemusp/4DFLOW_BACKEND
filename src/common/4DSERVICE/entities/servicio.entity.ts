import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'SERVICIO' })
export class SERVICIO{

    @PrimaryColumn({ name: 'Servicio', type: 'int' })
    service: number;

    @Column({ name: 'Descripcion', type: 'varchar', length: 50 })
    description: string;

    @Column({ name: 'Serie', type: 'char', length: 1 })
    series: string;
}