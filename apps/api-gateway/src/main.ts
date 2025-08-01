/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import initializeSiteConfig from './libs/initializeSiteConfig';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],

  credentials: true,
}));

app.use(morgan('dev'));
app.use(cookieParser());
app.set("trust proxy",1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req:any)=> (req.user ? 1000 : 100), // Limit each user to 1000 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, 
  message: {error: "Too many requests, please try again later."},
  keyGenerator:(req:any) => req.ip, // Use the IP address as the key
});

app.use(limiter);


app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use('/seller', createProxyMiddleware({ target: "http://localhost:6008", changeOrigin: true }));
app.use("/chatting", createProxyMiddleware({ target: "http://localhost:6005", changeOrigin: true, ws: true }));
app.use("/admin", createProxyMiddleware({ target: "http://localhost:6004", changeOrigin: true }));
app.use("/order", createProxyMiddleware({ target: "http://localhost:6003", changeOrigin: true }));
app.use("/product", createProxyMiddleware({ target: "http://localhost:6002", changeOrigin: true }));
app.use("/", createProxyMiddleware({ target: "http://localhost:6001", changeOrigin: true }));


const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig();
    console.log('Site config initialized Successfully! ');
  } catch (error) {
    console.error('Error initializing site config:', error);
  }
});
server.on('error', console.error);
