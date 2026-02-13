import express from 'express';
import { errorHandler } from './utils/errorHandler';
import routes from './routes';

const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
