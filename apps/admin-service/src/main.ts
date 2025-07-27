import express from 'express';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import router from './routes/admin.route';
import cors from 'cors';


const app = express();
app.use(cors({
    origin: ['http://localhost:3002'], 
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
  res.send({ message: 'Welcome to admin-service!' });
});


app.use('/api', router);

app.use(errorMiddleware);

const port = process.env.PORT || 6004;

const server = app.listen(port, () => {
  console.log(`Admin service at http://localhost:${port}/api`);
});
server.on('error', console.error);