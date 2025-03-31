require("dotenv").config(); 

import express from 'express';
import authRoutes from './routes/auth/routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import timetableRoutes from './routes/timetable/routes'
import rescheduleRoutes from './routes/reschedule/route'
const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
app.use(cookieParser());
app.use(express.json()); 

app.use("/", authRoutes);
app.use('/', timetableRoutes)
app.use('/', rescheduleRoutes)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});