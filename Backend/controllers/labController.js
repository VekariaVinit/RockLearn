const { fetchAllFiles, fetchFileContent } = require('../utilities/githubApi');

// Controller to handle fetching all files from the repository
async function getAllFiles(req, res) {
    const repoName = req.params.repoName;
    try {
        const allFiles = await fetchAllFiles(repoName);

        // Initialize an object to hold directories
        const directories = {};

        // Separate files into directories and files
        allFiles.forEach(file => {
            const filePathParts = file.path.split('/'); // Split the file path by '/'
            const fileName = filePathParts.pop(); // Get the last part as file name
            const dirPath = filePathParts.join('/'); // Join the remaining parts to form the directory path

            // If the directory doesn't exist, initialize it
            if (!directories[dirPath]) {
                directories[dirPath] = {
                    files: [],
                };
            }

            // Push the file to the corresponding directory
            directories[dirPath].files.push({ name: fileName, ...file });
        });

        // Send JSON response instead of rendering a view
        res.json({ directories, repoName });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Error fetching files' });
    }
}

// Function to get the content of a specific file
async function getFileContent(req, res) {
    // Extract the repository name and file path from the URL params
    const repoName = req.params.repoName;  // First part after `/content/`
    const filePath = req.params[0];  // Second part is the file path

    try {
        // Fetch the content of the specific file
        const content = await fetchFileContent(repoName, filePath.trim()); // Ensure any leading/trailing spaces are removed

        // Send the file content as a response
        res.json({ content });
    } catch (error) {
        console.error(`Error fetching content for file ${filePath}:`, error);
        res.status(500).json({ message: 'Error fetching file content' });
    }
}

module.exports = { getAllFiles, getFileContent };
