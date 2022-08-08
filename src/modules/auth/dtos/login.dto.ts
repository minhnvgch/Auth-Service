import { IsEmpty, IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsString()
    recaptcha: string;
}
