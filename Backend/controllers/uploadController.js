// /controllers/labController.js
const multer = require('multer');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config/config');

const git = simpleGit();

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

const uploadLab = async (req, res) => {
    const { labName, branch } = req.body;
    const labPath = path.join(__dirname, '..', 'uploads', labName); // Adjust to ensure it's pointing to the right directory

    try {
        // Create the lab directory
        fs.mkdirSync(labPath, { recursive: true });

        // Move uploaded files into the lab directory
        req.files.forEach(file => {
            const tempPath = file.path;
            const targetPath = path.join(labPath, file.originalname);
            fs.renameSync(tempPath, targetPath); // Move the file
            console.log(`Moved file: ${tempPath} to ${targetPath}`); // Log file movement
        });

        // Initialize Git in the lab directory
        const git = simpleGit(labPath); // Ensure git is initialized in the lab path
        const initOutput = await git.init(); // Initialize git repository
        console.log('Git init output:', initOutput);

        const remoteUrl = `https://${config.githubUsername}:${config.githubToken}@github.com/${config.githubUsername}/${labName}.git`;

        // Check if the repository exists and create it if it doesn't
        try {
            await createGithubRepo(labName);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                console.log('Repository already exists on GitHub.');
            } else {
                throw error; // Rethrow if it's a different error
            }
        }

        // Add files to staging
        for (const file of req.files) {
            const targetPath = path.join(labPath, file.originalname);
            await git.add(targetPath);
            console.log(`Added file to staging: ${targetPath}`);
        }

        // Make an initial commit
        const commitOutput = await git.commit(`Initial commit for lab: ${labName}`);
        console.log('Commit output:', commitOutput);

        // Check for existing remotes
        const remotes = await git.getRemotes();

        // Add the remote only if it doesn't already exist
        if (!remotes.some(remote => remote.name === 'origin')) {
            await git.addRemote('origin', remoteUrl);
            console.log(`Added remote: ${remoteUrl}`); // Log remote addition
        }

        // Check if the branch exists
        const branchName = branch || 'main';
        const branchExists = await git.branch(['-a']).then(branches => {
            return branches.all.includes(`remotes/origin/${branchName}`) || branches.current === branchName;
        });

        if (!branchExists) {
            // Create and switch to the new branch if it doesn't exist
            await git.checkoutLocalBranch(branchName);
            console.log(`Created and checked out branch: ${branchName}`); // Log branch creation
        } else {
            // Checkout the existing branch
            await git.checkout(branchName);
            console.log(`Checked out existing branch: ${branchName}`); // Log branch checkout
        }

        // Push to the specified branch
        try {
            const pushOutput = await git.push('origin', branchName, { '--set-upstream': true });
            console.log('Push output:', pushOutput);
        } catch (error) {
            console.error('Error pushing to remote:', error.message);
        }

        // Remove the temp folder after upload
        fs.rmSync(labPath, { recursive: true, force: true });
        console.log(`Temporary lab folder removed: ${labPath}`);

        res.status(201).json({ message: 'Lab created, files uploaded, and temp folder removed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating lab: ' + error.message });
    }
};





// Expose the upload middleware and controller
module.exports = { upload, uploadLab };




