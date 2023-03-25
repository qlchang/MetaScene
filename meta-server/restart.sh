#! /bin/bash
cp config.production1.yaml config.yaml
npm run build
NODE_ENV=production pm2 restart main