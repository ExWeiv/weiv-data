"use strict";
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const loadEnv = () => {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
        dotenv.parse(fs.readFileSync(envPath));
        dotenv.config({ path: envPath });
    }
    else {
        console.warn('.env file not found');
    }
};
module.exports = loadEnv;
