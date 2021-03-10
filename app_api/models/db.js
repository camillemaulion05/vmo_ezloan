import {
    connect as _connect,
    connection
} from 'mongoose';
import {
    createInterface
} from 'readline';

const connect = () => {
    setTimeout(() => _connect(process.env.MONGODB_URI, {
        useFindAndModify: false,
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }), 1000);
}

connection.on('connected', () => {
    console.log('connected');
});

connection.on('error', err => {
    console.log('error: ' + err);
    return connect();
});

connection.on('disconnected', () => {
    console.log('disconnected');
});

if (process.platform === 'win32') {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('SIGINT', () => {
        process.emit("SIGINT");
    });
}

const gracefulShutdown = (msg, callback) => {
    connection.close(() => {
        console.log(`Mongoose disconnected through ${msg}`);
        callback();
    });
};

process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});
process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0);
    });
});
process.on('SIGTERM', () => {
    gracefulShutdown('Heroku app shutdown', () => {
        process.exit(0);
    });
});

connect();

import './users';
import './inquiries';
import './employees';
import './transactions';
import './withdrawals';
import './borrowers';
import './loans';