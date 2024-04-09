import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import { join } from 'path';
import configuration from 'src/config/configuration';

let logDir: string;
if (process.env.NODE_ENV === 'development') {
  logDir = join(__dirname, './../log');
  console.log('测试服log', logDir);
}
if (process.env.NODE_ENV === 'production') {
  logDir = join(configuration().log.logFolder);
  console.log('正式服log', logDir);
}
console.log('logDir', logDir);
export const LoggerConfig = {
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss SSS',
    }),
    winston.format.ms(),
    winston.format.json(),
    // winston.format.printf(
    //   (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    // ),
    nestWinstonModuleUtilities.format.nestLike('Meta-server', {
      prettyPrint: false,
    }),
  ),
  exitOnError: false,
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({
    //   dirname: logDir, //path to where save loggin result
    //   filename: 'combine.log', //name of file where will be saved logging result
    //   level: 'debug',
    // }),
    // new winston.transports.File({
    //   dirname: logDir, //path to where save loggin result
    //   filename: 'combine.log', //name of file where will be saved logging result
    //   level: 'log',
    // }),
    // new winston.transports.File({
    //   dirname: logDir,
    //   filename: 'error.log',
    //   level: 'error',
    // }),

    new winston.transports.File({
      dirname: logDir,
      filename: 'combine.log',
      level: 'error',
    }),
    new winston.transports.File({
      dirname: logDir,
      filename: 'combine.log',
      level: 'info',
    }),
  ],
};
