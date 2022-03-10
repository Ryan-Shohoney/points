const transformer = require('@nestjs/swagger/plugin');

// https://docs.nestjs.com/openapi/cli-plugin#integration-with-ts-jest-e2e-tests
module.exports = {
    name: 'nestjs-swagger-transformer',
    version: 1,
    factory: (cs) => transformer.before({}, cs.program)
};