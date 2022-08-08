export const jwtConstants = {
  secret: 'Minh',
};

export const saltBcrypt = 12;

export enum AuthErrorMessage {
  InvalidUser = 'Opps! Your username or password is not correct. Please try again',
  UserExist = 'Username exist. Please choose another username for register',
  PasswordNotMatch = 'Password and confirm password is not match. Please try again',
  AccountIsLocked = "You have too many wrong logins. Your account is locked. Unlock after ",
  WrongCaptcha = 'Captcha is wrong. Try again!'
}
