
import express from 'express';
import cookieParser from "cookie-parser";
import { createWebSocketServer } from './websocket';
import { startConsumer } from './chat-message.consumer';
import router from './routes/chatting.route';
import cors from 'cors';


const app = express();
app.use(cors({
    origin: ['http://localhost:3000'], 
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to chatting-service!' });
});

app.use('/api',router);


const port = process.env.PORT || 6005;
const server = app.listen(port, () => {
  console.log(`Chat Service listening at http://localhost:${port}/api`);
});


createWebSocketServer(server);

startConsumer().catch((error:any) => {
  console.error('Error starting consumer:', error);
});


server.on('error', console.error);
