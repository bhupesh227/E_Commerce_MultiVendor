import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require("./swagger-output.json");

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send({ message: 'Hello API'});
});

app.use("/api-docs",swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

// Mounting the auth router
app.use("/api",router);

app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
    console.log(`Auth server Listening at http://localhost:${port}/api`);
    console.log(`Swagger Docs available at http://localhost:${port}/docs`)
});
server.on('error', (error) => {
    console.error('Server error:', error);
});
