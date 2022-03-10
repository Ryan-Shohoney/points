import { INestApplication, ValidationPipe } from '@nestjs/common';
import { isUUID } from '@nestjs/common/utils/is-uuid';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DefaultValidationPipeOptions } from '../main.types';
import { UserModule } from './user.module';
import { v4 as uuid } from 'uuid';

describe('E2E: UserController', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
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

  it('Lists 0 Users: / (GET)', () => {
    return request(app.getHttpServer()).get('/user').expect(200).expect([]);
  });
  let insertedUserId;
  it('Adds User: / (POST)', () => {
    return request(app.getHttpServer())
      .post('/user')
      .send({ firstName: 'test', lastName: 'user' })
      .then(({ text }) => {
        expect(isUUID(text)).toBeTruthy();
        insertedUserId = text;
      });
  });

  it('Does not find a user in an empty list', () => {
    return request(app.getHttpServer()).get(`/user/${uuid()}`).expect(404);
  });

  it('Lists 1 Users: / (GET)', () => {
    return request(app.getHttpServer())
      .get('/user')
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveLength(1);
      });
  });

  it('Gets the correct user: / (GET)', () => {
    return request(app.getHttpServer())
      .get(`/user/${insertedUserId}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            firstName: 'test',
            lastName: 'user',
            points: 0,
            id: insertedUserId,
          }),
        );
      });
  });

  it('Updates the user: /:id (PUT)', () => {
    return request(app.getHttpServer())
      .put(`/user/${insertedUserId}`)
      .send({ lastName: 'updated' })
      .expect(204);
  });

  it('Throws an error when a forbidden parameter is present: /:id (PUT)', () => {
    return request(app.getHttpServer())
      .put(`/user/${insertedUserId}`)
      .send({ id: insertedUserId })
      .expect(400);
  });

  it('Has the updated values: /:id (GET)', () => {
    return request(app.getHttpServer())
      .get(`/user/${insertedUserId}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            firstName: 'test',
            lastName: 'updated',
            points: 0,
            id: insertedUserId,
          }),
        );
      });
  });

  it('Does nothing bad on a bad delete call: /:id (DELETE)', () => {
    return request(app.getHttpServer()).del(`/user/${uuid()}`).expect(404);
  });

  it('Deletes the correct user: /:id (DELETE)', () => {
    return request(app.getHttpServer())
      .del(`/user/${insertedUserId}`)
      .expect(204);
  });

  it('Reflects a deleted user', () => {
    return request(app.getHttpServer()).get('/user').expect(200).expect([]);
  });
});
