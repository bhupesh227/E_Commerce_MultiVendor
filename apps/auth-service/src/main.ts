import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';

const app = express();

app.use(cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
}));

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});

app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
    console.log(`Auth Listening at http://localhost:${port}/api`);
});
server.on('error', (error) => {
    console.error('Server error:', error);
});
