# Points! API
## Description
A simple API to track users and their corresponding points balance, brought to you by [NestJS](https://github.com/nestjs/nest)
and persistence through [Redis](https://redis.io/).

## Pre-requisites
You'll need to install a few things before we get started.  Below are links to each tool and how to install them:
 - [Node.js LTS](https://nodejs.org/en/download/) 
   - you can optionally satisfy this requirement by using some form of a node version switcher, i.e. `nvm`, `nvm-windows`, or `nvs`. 
 - [Docker](https://docs.docker.com/get-docker/)
   - As noted, Docker Desktop for both Mac and Windows include docker compose.  If, because of licensing reasons you 
      are unable to use Docker Desktop, you can follow this [guide](https://docs.docker.com/compose/install/)
 - [Yarn](https://yarnpkg.com/getting-started/install) (npm should work, but this project was generated and tooled with Yarn in mind)  

## Installation
Now that you have the pre-requisites complete, you should be able to simply install the application!
```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov

# TDD mode
$ yarn test:watch
```

## API Documentation and Postman Collection
Once you `yarn start` (of any flavor), you can navigate to [http://localhost:3000/api](http://localhost:3000/api) to 
access the Swagger API Docs. Additionally, you can import the collection to any tool that supports importing OpenAPI
specifications by using this url [http://localhost:3000/api-json](http://localhost:3000/api-json)

## Issues
If something isn't working, please file an [issue](https://github.com/Ryan-Shohoney/points/issues). Reproduction steps 
are useful, but a simple explanation is probably sufficient!
