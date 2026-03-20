import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from '../src/server/api';

const app = express();
const uploadDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve any pre-existing public assets that are part of the deployment bundle.
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(uploadDir));

app.use('/api', apiRoutes);

export default app;
