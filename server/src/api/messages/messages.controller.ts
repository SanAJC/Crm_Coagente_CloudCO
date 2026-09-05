import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SendMessageDto } from './dto/send-message.dto.js';
import { UpdateConversationDto } from './dto/update-conversation.dto.js';
import { MessagesService } from './messages.service.js';
import { SendMessagePipe } from './pipes/send-message.pipe.js';
import { UpdateConversationPipe } from './pipes/update-conversation.pipe.js';

@Controller('conversaciones')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.messagesService.findAllConversaciones(estado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.findConversacion(id);
  }

  @Get(':id/mensajes')
  findMensajes(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.findMensajes(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(UpdateConversationPipe) dto: UpdateConversationDto,
  ) {
    return this.messagesService.updateConversacion(id, dto);
  }

  @Post(':id/mensajes')
  @HttpCode(HttpStatus.CREATED)
  enviarMensaje(
    @Param('id', ParseIntPipe) id: number,
    @Body(SendMessagePipe) dto: SendMessageDto,
    @Req() req: Request,
  ) {
    const user = (req as Request & { user?: { userId?: number } }).user;
    if (!user?.userId) {
      throw new UnauthorizedException('No se encontró el usuario autenticado');
    }
    return this.messagesService.enviarMensaje(id, dto, user.userId);
  }
}
