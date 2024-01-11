// const dotenv = require('dotenv');
// const fs = require('fs');
// const path = require('path');

// const loadEnv = () => {
//     // Specify the path to the .env file
//     const envPath = path.resolve(__dirname, '../../.env');

//     // Check if the .env file exists
//     if (fs.existsSync(envPath)) {
//         // Load the .env file
//         dotenv.parse(fs.readFileSync(envPath));

//         // Merge the environment variables
//         dotenv.config({ path: envPath });
//     } else {
//         console.warn('.env file not found');
//     }
// }

// export = loadEnv;