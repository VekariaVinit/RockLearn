// /controllers/labController.js
const multer = require('multer');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config/config');
const {saveMetadata} = require('./homepageController');

const git = simpleGit();
require("dotenv").config();
const github_username = process.env.GITHUB_USERNAME;

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ''); // Leave it empty; we'll handle it after
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

// Initialize multer
const upload = multer({ storage });

// Create a GitHub repository
const createGithubRepo = async (repoName) => {
    const url = 'https://api.github.com/user/repos';
    const token = config.githubToken;

    const response = await axios.post(url, {
        name: repoName,
        private: false,
    }, {
        headers: {
            Authorization: `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
        },
    });

    return response.data;
};

const uploadLab = async (req, res, labName, tags, files) => {
    const {filePaths} = req.body;
    const labPath = path.join(__dirname, '..', 'uploads', labName); // Adjust to ensure it's pointing to the right directory
    
    const repoData = {
        title: labName, // You can map labName as title
        url: `https://github.com/${github_username}/${labName}`, // Construct the URL
        description: 'No description available', // Assuming files might have a description field
        tags: tags, // Attach the tags passed from the frontend
    };
    
    saveMetadata(repoData)
    
    try {       

        // Remove the first part of the file path before the first "/"
        const modifiedFilePaths = filePaths.map(filePath => {
            const firstSlashIndex = filePath.indexOf('/');
            return firstSlashIndex !== -1 ? filePath.slice(firstSlashIndex + 1) : filePath;
        });

        // Create the lab directory
        fs.mkdirSync(labPath, { recursive: true });

        // Process and move files
        req.files.forEach((file, index) => {
            // Use the modified paths
            const relativePath = modifiedFilePaths[index];

            const targetPath = path.join(labPath, relativePath);
            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            fs.renameSync(file.path, targetPath);
        });

        // Initialize Git in the lab directory
        const git = simpleGit(labPath);
        const initOutput = await git.init();

        const remoteUrl = `https://${config.githubUsername}:${config.githubToken}@github.com/${config.githubUsername}/${labName}.git`;

        // Check if the repository exists and create it if it doesn't
        try {
            await createGithubRepo(labName);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // console.log('Repository already exists on GitHub.');
            } else {
                throw error; // Rethrow if it's a different error
            }
        }

        // Add files to staging using modified paths
        for (const modifiedPath of modifiedFilePaths) {
            const fullPath = path.join(labPath, modifiedPath);
            await git.add(fullPath);
        }

        // Make an initial commit
        const commitOutput = await git.commit(`Initial commit for lab: ${labName}`);

        // Check for existing remotes
        const remotes = await git.getRemotes();
        if (!remotes.some(remote => remote.name === 'origin')) {
            await git.addRemote('origin', remoteUrl);
        }

        // Check if the branch exists
        const branchName = 'main';
        const branchExists = await git.branch(['-a']).then(branches => {
            return branches.all.includes(`remotes/origin/${branchName}`) || branches.current === branchName;
        });

        if (!branchExists) {
            await git.checkoutLocalBranch(branchName);
        } else {
            await git.checkout(branchName);
        }

        // Push to the specified branch
        try {
            const pushOutput = await git.push('origin', branchName, { '--set-upstream': true });
        } catch (error) {
            console.error('Error pushing to remote:', error.message);
            console.error('Full error details:', error);
        }

        // Optional: Remove the temp folder after upload
        fs.rmSync(labPath, { recursive: true, force: true });

        res.status(201).json({ message: 'Files uploaded successfully with structure maintained.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating lab: ' + error.message });
    }
};






// Expose the upload middleware and controller
module.exports = { upload, uploadLab };




