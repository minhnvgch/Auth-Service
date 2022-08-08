import { IsEmail, IsIn, IsOptional, IsPhoneNumber, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    username: string;

    @IsString()
    @MinLength(4)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
    password: string;

    @IsString()
    @MinLength(4)
    @MaxLength(20)
    confirmPassword: string;

    @IsOptional()
    @IsString()
    @IsIn(['admin', 'user'])
    role: string;

    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsPhoneNumber()
    phonenumber: string;

    @IsOptional()
    @IsEmail()
    verify_email: string;

    @IsOptional()
    @IsPhoneNumber()
    verify_phonenumber: string;
}
