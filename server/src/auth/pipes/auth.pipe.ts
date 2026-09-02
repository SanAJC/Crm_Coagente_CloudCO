import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class AuthPipe implements PipeTransform {
    transform(value: any) {
        if (!this.isEmailValid(value.email)) {
          throw new BadRequestException('Formato de email inválido');
        }
  
        if (!this.isPasswordValid(value.password)) {
          throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
        }
  
        return value;   
    }
    private isEmailValid (email : string ){
      return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    private isPasswordValid (password :  string){
      return password && password.length < 8;
    }

}