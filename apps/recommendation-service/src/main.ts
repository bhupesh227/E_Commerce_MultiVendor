
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
}));

app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());



app.get('/', (req, res) => {
  res.send({ message: 'Welcome to recommendation-service!' });
});

const port = process.env.PORT || 6006;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});
server.on('error', console.error);
