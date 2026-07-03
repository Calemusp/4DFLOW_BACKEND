import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class CreateTicketDto {

    @ApiProperty({
        description: 'ID de la cita',
        example: 287746,
    })
    @IsNumber()
    appointmentId!: number;
}
