import { createLogger, format, transports } from 'winston';

const { combine, timestamp, colorize, printf, splat } = format;

const myFormat = printf(info =>
	`${info.timestamp} ${info.level}: ${info.message}`);

const logger = createLogger({
	format: combine(
		colorize(),
		timestamp(),
		splat(),
		myFormat
	),
	transports: [new transports.Console()]
});

export default logger;
