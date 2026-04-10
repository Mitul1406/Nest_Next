import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) {}

    async register(dto:RegisterDto){
        const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });

        if(existingUser){
            throw new ConflictException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = this.userRepository.create({
            name: dto.name,
            email: dto.email,
            dateOfBirth: dto.dateOfBirth,
            password: hashedPassword,
        });

        const saved = await this.userRepository.save(user);

        return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
    };
    }

    async login(dto:LoginDto){
        const user = await this.userRepository.findOne({where:{email: dto.email}});

        if(!user){
            throw new BadRequestException({message: 'Invalid credentials'});
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);

        if(!isMatch){
            throw new BadRequestException({message: 'Invalid credentials'});
        }

        const payload = { sub: user.id, email: user.email };
        const token = this.jwtService.sign(payload);

        return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        };
        
    }
}
