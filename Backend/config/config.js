// /config/config.js
require('dotenv').config();

const config = {
    githubToken: process.env.GITHUB_TOKEN,
    githubUsername: process.env.GITHUB_USERNAME,
};

module.exports = config;
