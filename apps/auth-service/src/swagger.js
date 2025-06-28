
import swaggerAutogen from 'swagger-autogen';


const doc = {
    info: {
        title: 'EComm Auth Service',
        description: 'API documentation for the EComm Auth Service',
        version: '1.0.0',
    },
    host: 'localhost:6001',
    schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/auth.router.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);