import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: "Name is required!" })
  @Length(1, 50, { message: "Name must be less than 50 chars!" })
  name!: string;

  @IsEmail({}, { message: "Email must be valid!" })
  @IsNotEmpty({ message: "Email is required!" })
  email!: string;

  @Length(8, 32, { message: "Password must be between 8 to 32 chars" })
  password!: string;

  // @Matches('password', { message: "Password didn't match!" })
  // confirmPassword!: string;
}
