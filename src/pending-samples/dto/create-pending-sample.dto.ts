import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString, Min } from "class-validator";

export class CreatePendingSampleDto {

    @ApiProperty({
        description: 'Etapa del ticket (0 = en espera)',
        example: 0,
    })
    @IsNumber()
    @Min(0)
    stage!: number;


    @ApiProperty({
        description: 'Id del servicio',
        example: 1,
    })
    @IsNumber()
    @IsPositive()
    service!: number
}

export class NextPatientDto{
    @IsNumber()
    service!: number;

    @IsNumber()
    stage!: number;

    @IsNumber()
    window!: number;

    @IsString()
    user!: string
}

export class CallTicketDto{

    @IsNumber()
    ticket!: number;

    @IsNumber()
    window!: number;

}


export class EndServiceTicketDto{

    @IsNumber()
    @Min(0)
    ticket!: number;

    @IsNumber()
    @Min(0)
    window!: number;

    @IsNumber()
    stage!: number;
}


export class printLabelsDto{
    
    
    @ApiProperty({
        description: 'Ticket actual',
        example: 248435,
    })
    @IsNumber()
    ticket!: number;

        @ApiProperty({
        description: 'Ventanilla que imprime las etiquetas',
        example: 8,
    })
    @IsNumber()
    window!:number;
}