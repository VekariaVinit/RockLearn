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
// const multer = require('multer');

// Setup storage for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        cb(null, uploadDir); // Ensure 'uploads' directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Initialize Multer with storage configuration
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

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
    const repoData = {
        title: labName,
        url: `https://github.com/${config.githubUsername}/${labName}`,
        description: 'No description available',
        tags: tags,
    };

    // Save metadata to the database
    saveMetadata(repoData);

    try {
        if (!labName || !files || files.length === 0) {
            console.log('Missing labName or files');
            return res.status(400).json({ message: 'Lab name or files missing' });
        }

        // Ensure the root lab directory exists
        const labDir = path.join(__dirname, '..', 'uploads', labName);
        if (!fs.existsSync(labDir)) {
            fs.mkdirSync(labDir, { recursive: true });
        }

        // Initialize an array to collect all modified file paths
        const modifiedPaths = [];

        // Function to recursively handle folder structure and move files
        const createDirectoryStructure = (filePath, file) => {
            const dirs = filePath.split('/').slice(0, -1); // Remove the last element (file name)
            let currentDir = labDir;

            // Loop through each directory level, skipping the first directory
            dirs.slice(1).forEach((dir) => {
                currentDir = path.join(currentDir, dir);
                if (!fs.existsSync(currentDir)) {
                    fs.mkdirSync(currentDir, { recursive: true });
                }
            });

            const destPath = path.join(currentDir, file.originalname);
            if (fs.existsSync(destPath)) {
                console.log(`File ${destPath} already exists.`);
                return; // Skip renaming if the file exists
            }

            fs.renameSync(file.path, destPath);
            console.log("destpath ::", destPath);

            // Push the destination path to the modifiedPaths array
            modifiedPaths.push(destPath);
        };

        // Move each uploaded file to its appropriate path
        files.forEach((file, index) => {
            const filePath = req.body.filePaths[index];
            createDirectoryStructure(filePath, file);
        });

        // Initialize Git in the lab directory
        const git = simpleGit(labDir);
        const initOutput = await git.init();

        const remoteUrl = `https://${config.githubUsername}:${config.githubToken}@github.com/${config.githubUsername}/${labName}.git`;

        // Check if the repository exists and create it if it doesn't
        try {
            await createGithubRepo(labName);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Repository already exists, no need to create again
            } else {
                throw error; // Rethrow if it's a different error
            }
        }

        // Add files to staging using modified paths
        for (const modifiedPath of modifiedPaths) {
            await git.add(modifiedPath);
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
        fs.rmSync(labDir, { recursive: true, force: true });

        res.status(201).json({ message: 'Files uploaded successfully with structure maintained.' });
    } catch (err) {
        console.error('Error in uploadLab:', err);
        res.status(500).json({ message: 'Error during lab upload', error: err.message });
    }
};


// Expose the upload middleware and controller
module.exports = {upload, uploadLab };




