/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';
import proxy from "express-http-proxy";
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import initializeSiteConfig from './libs/initializeSiteConfig';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true ,limit: '100mb' }));
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


app.use("/chatting", proxy("http://localhost:6005"));
app.use("/admin", proxy("http://localhost:6004"));
app.use("/order", proxy("http://localhost:6003"));
app.use("/product", proxy("http://localhost:6002"));
app.use("/", proxy("http://localhost:6001"));


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
