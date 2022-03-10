import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isUUID } from 'class-validator';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { DefaultValidationPipeOptions } from '../main.types';
import { UserModule } from '../user/user.module';
import { BalanceModule } from './balance.module';
const ONE_DAY = 1000 * 60 * 60 * 24;
describe('E2E: BalanceController', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BalanceModule, UserModule],
    }).compile();
    app = module.createNestApplication();
    app.enableShutdownHooks();
    app.useGlobalPipes(
      new ValidationPipe({
        ...DefaultValidationPipeOptions,
        enableDebugMessages: true,
      }),
    );
    await app.init();
  });
  afterEach(async () => await app.close());
  let userId: string;

  it('Handles trying to reduce points from non-existent users: /balance/:id/pay (PUT)', () => {
    const id = uuid();
    return request(app.getHttpServer())
      .put(`/balance/${id}/pay`)
      .send({
        amount: 500,
      })
      .expect(404);
  });

  it('Inserts a user: /user (POST)', () => {
    return request(app.getHttpServer())
      .post('/user')
      .send({
        firstName: 'test',
        lastName: 'user',
        points: 1000,
      })
      .then(({ text }) => {
        expect(isUUID(text)).toBeTruthy();
        userId = text;
      });
  });

  it("Gets the User's balance: /balance/:id (GET)", () => {
    return request(app.getHttpServer())
      .get(`/balance/${userId}`)
      .then(({ text }) => {
        expect(parseInt(text, 10)).toEqual(1000);
      });
  });

  it('Adds payments: /balance/:id/reward (PUT)', async () => {
    await request(app.getHttpServer()).put(`/balance/${userId}/reward`).send({
      amount: 500,
      payer: 'NestJS',
      timestampMS: Date.now() - ONE_DAY
    });

    await request(app.getHttpServer()).put(`/balance/${userId}/reward`).send({
      amount: 200,
      payer: 'NodeJS',
      timestampMS: Date.now()
    });

    return request(app.getHttpServer())
      .get(`/balance/${userId}`)
      .then(({ text }) => {
        expect(parseInt(text, 10)).toEqual(1700);
      });
  });

  it('Returns a detailed ledger: /balance/:id/detailed (GET)', async () => {
    await request(app.getHttpServer())
      .get(`/balance/${userId}/detailed`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveLength(3);
      });
  });

  it('Handles payments higher than the available balance: /balance/:id/pay (PUT)', async () => {
    return request(app.getHttpServer())
      .put(`/balance/${userId}/pay`)
      .send({ amount: 100000 })
      .expect(400);
  });

  it('Handles deducting payments from multiple payers: /balance/:id/pay (PUT)', async () => {
    await request(app.getHttpServer())
      .put(`/balance/${userId}/pay`)
      .send({ amount: 1100 });

    return request(app.getHttpServer())
      .get(`/balance/${userId}`)
      .then(({ text }) => {
        expect(parseInt(text, 10)).toEqual(600);
      });
  });

  it('Returns an updated ledger: /balance/:id/detailed (GET)', async () => {
    return request(app.getHttpServer())
      .get(`/balance/${userId}/detailed`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveLength(2);
      });
  });

  it('Deletes ledgers for deleted users: /user/:id (DEL)', async () => {
    await request(app.getHttpServer()).del(`/user/${userId}`);

    return request(app.getHttpServer())
      .get(`/balance/${userId}/detailed`)
      .expect(404);
  });
});
