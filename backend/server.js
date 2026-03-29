import express, { json, urlencoded } from "express";
import { connect } from 'mongoose';
import User from './Schema/UserSchema.js';
const app = express();
app.set('trust proxy', true);
const port = 3000;
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config.js';
import {UAParser} from "ua-parser-js";


connect(process.env.MONGOOSE_URI)
    .then(()=>{
    console.log("connected to mongodb atlas");
}).catch((err)=>{
    console.log("Error connecting to mongodb: " , err);
});


app.use(json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const isProd = process.env.NODE_ENV === "production";
app.use(cors({
  origin: isProd ?'https://link-shortener-frontend-i663.onrender.com' : 'http://localhost:5173',
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


import routerUser from './Routes/User.js';
import routerLinks from './Routes/Links.js';

app.use('/user', routerUser);
app.use('/links', routerLinks);


// The redirect route (after all API routes)
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const user = await User.findOne({  "links.shortCode": code });
    if (!user) return res.status(404).send(`Short link not found ${code},   ||||  ${user}`);

    const link = user.links.find((l) => l.shortCode === code);

    if (link.expirationDate != null && link.expirationDate < new Date()) {
      return res.status(410).send("This link has expired");
    }

    link.clicks += 1;

    // parse device info
    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();

    const rawIp = req.ip;
    let ip = rawIp;
    // convert IPv6 localhost
    if (rawIp === "::1") ip = "127.0.0.1";
    // convert IPv6-mapped IPv4
    if (rawIp.startsWith("::ffff:")) {
      ip = rawIp.replace("::ffff:", "");
    }

    link.analytics = link.analytics || [];
    link.analytics.push({
      timestamp: new Date(),
      ip,
      os: result.os.name,
      device: result.device.type || "desktop"
    });

    await user.save();

    return res.redirect(link.originalUrl);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// ======================================== Starting the server ============================================================//
app.listen(port, ()=>{
    console.log("-------Listening on port,", port, "------------");    
})

app.get('/', (req, res)=>{
    res.send("Hello from server of link shortner");
})
