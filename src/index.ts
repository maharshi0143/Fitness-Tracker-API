import app from './app';
import { prisma } from './utils/prisma';

const port = process.env.API_PORT || 3000;

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const shutdown = async () => {
    server.close(() => {
        void prisma.$disconnect();
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
