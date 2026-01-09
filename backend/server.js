import express, { json, urlencoded } from "express";
import { connect } from 'mongoose';
import User from './Schema/UserSchema.js';
const app = express();
const port = 3000;
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config.js';

app.use(json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));


app.use(cors({
  origin: 'https://link-shortener-frontend-i663.onrender.com',
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


import routerUser from './Routes/User.js';
import routerLinks from './Routes/Links.js';

app.use('/user', routerUser);
app.use('/links', routerLinks);


// 👉 Place the redirect route HERE (after all API routes)
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const user = await User.findOne({  "links.shortCode": code });
    if (!user) return res.status(404).send(`Short link not found ${code},   ||||  ${user}`);

    const link = user.links.find((l) => l.shortCode === code);

    if (link.expirationDate && link.expirationDate < new Date()) {
      return res.status(410).send("This link has expired");
    }

    link.clicks += 1;
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

connect(process.env.MONGOOSE_URI)
    .then(()=>{
    console.log("connected to mongodb atlas");
}).catch((err)=>{
    console.log("Error connecting to mongodb: " , err);
});

app.get('/', (req, res)=>{
    res.send("Hello from server of link shortner");
})
