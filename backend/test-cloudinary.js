require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

console.log('Testing Cloudinary Connection...');
console.log('Cloud Name:', cloud_name, `(Length: ${cloud_name ? cloud_name.length : 'Missing'})`);
console.log('API Key:', api_key ? `${api_key.substring(0, 4)}... (Length: ${api_key.length})` : 'Missing');
console.log('API Secret:', api_secret ? `${api_secret.substring(0, 4)}... (Length: ${api_secret.length})` : 'Missing');

if (api_secret && api_secret.trim().length !== api_secret.length) {
    console.warn('⚠️  WARNING: API Secret has leading or trailing spaces! This will cause authentication failure.');
}

if (cloud_name && cloud_name.trim().length !== cloud_name.length) {
    console.warn('⚠️  WARNING: Cloud Name has leading or trailing spaces!');
}

cloudinary.api.ping()
    .then(res => {
        console.log('✅ Connection Successful!');
        console.log('Ping Result:', res);
    })
    .catch(err => {
        console.error('❌ Connection Failed!');
        console.dir(err, { depth: null });
    });
