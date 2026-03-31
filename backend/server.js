import express from 'express'; 
import cors from 'cors'; 
import dotenv from 'dotenv'; 
import bodyParser from 'body-parser'; 
import morgan from 'morgan'; // 1. Import morgan

import authRoutes from './routes/authRoutes.js';
// import zoneRoutes from './routes/zoneRoutes.js'; 
// import deviceRoutes from './routes/deviceRoutes.js'; 
// import plantTypeRoutes from './routes/plantTypeRoutes.js'; 

dotenv.config(); 

const app = express(); 
const PORT = process.env.PORT || 5000;
app.use(morgan('dev'));

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
})); 

app.use(bodyParser.json()); 

app.use('/api/auth', authRoutes); 
// app.use('/api/zones', zoneRoutes);
// app.use('/api/devices', deviceRoutes);
// app.use('/api/plant-types', plantTypeRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});