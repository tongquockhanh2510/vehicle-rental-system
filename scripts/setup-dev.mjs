import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { generateKeyPairSync } from 'crypto';
import path from 'path';

const root = process.cwd();

const servicesWithPublicKey = [
  'api-gateway',
  'contract-service',
  'dispute-service',
  'image-service',
  'notification-service',
  'payment-service',
  'rental-service',
  'review-service',
  'statistic-service',
  'tracking-service',
  'user-service',
  'vehicle-service'
];

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
});

for (const dir of servicesWithPublicKey) {
  const keyDir = path.join(root, dir, 'keys');
  mkdirSync(keyDir, { recursive: true });
  writeFileSync(path.join(keyDir, 'public.key'), publicKey);
}

const userKeyDir = path.join(root, 'user-service', 'keys');
mkdirSync(userKeyDir, { recursive: true });
writeFileSync(path.join(userKeyDir, 'private.key'), privateKey);

const imageEnvPath = path.join(root, 'image-service', '.env');
const imageEnvDefault = [
  'IMAGE_SERVICE_PORT=3007',
  'AWS_ACCESS_KEY_ID=local-dev-access-key',
  'AWS_SECRET_ACCESS_KEY=local-dev-secret-key',
  'AWS_REGION=ap-southeast-1',
  'AWS_BUCKET_NAME=local-dev-bucket',
  'SERVICE_TOKEN=internal-service-token'
].join('\n');

writeFileSync(imageEnvPath, `${imageEnvDefault}\n`);

const vehicleEnvPath = path.join(root, 'vehicle-service', '.env');
if (existsSync(vehicleEnvPath)) {
  const current = readFileSync(vehicleEnvPath, 'utf8');
  if (!/^(?:\s*)SERVICE_TOKEN=/m.test(current)) {
    writeFileSync(vehicleEnvPath, `${current.trimEnd()}\nSERVICE_TOKEN=internal-service-token\n`);
  }
}

console.log('DEV_SETUP_DONE');
