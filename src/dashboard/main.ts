import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { initORM } from 'orm'
import { init as initErrorHandler } from 'lib/error'
import { ValidationPipe } from '@nestjs/common'

function buildDocs(app: NestFastifyApplication) {
  const config = new DocumentBuilder()
    .setTitle('Terraswap Dashboard')
    .setDescription('Terraswap Dashboard API description')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
}

async function bootstrap() {
  initErrorHandler({ sentryDsn: process.env.SENTRY })

  await initORM()
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  if (process.env.OPEN_API === "true" ) {
    buildDocs(app)
  }

  await app.listen(process.env.SERVER_PORT || 3000, '0.0.0.0')
}

bootstrap()
