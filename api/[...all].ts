import express from 'express';
import cors from 'cors';
import path from 'path';
import type { Request, Response } from 'express';
import apiRoutes from '../src/server/api';

const uploadDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/uploads', express.static(uploadDir));
app.use('/api', apiRoutes);

export default function handler(req: Request, res: Response) {
  return app(req, res);
}

