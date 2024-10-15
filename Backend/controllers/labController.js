const { fetchAllFiles, fetchFileContent } = require('../utilities/githubApi');

// Controller to handle fetching all files from the repository
async function getAllFiles(req, res) {
    try {
        const allFiles = await fetchAllFiles();

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
            directories[dirPath].files.push({ name: fileName, path: file.path,download_url:file.download_url });
        });

        // Send directories and files as JSON response
        res.json(directories);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Error fetching files' });
    }
}

// Function to get the content of a specific file
async function getFileContent(req, res) {
    const filePath = req.params[0];  // Get the captured path from the wildcard

    try {
        // Fetch the content of the specific file
        const content = await fetchFileContent(filePath.trim()); // Ensure any leading/trailing spaces are removed

        // Check if content was retrieved successfully
        if (content === null) {
            return res.status(404).send('File not found');
        }

        // Send the file content as a response
        res.send(content);
    } catch (error) {
        console.error(`Error fetching content for file ${filePath}:`, error);
        res.status(500).send('Error fetching file content');
    }
}

module.exports = { getAllFiles, getFileContent };


// const { fetchAllFiles, fetchFileContent } = require('../utilities/githubApi');

// // Controller to handle fetching all files from the repository
// async function getAllFiles(req, res) {
//     try {
//         const allFiles = await fetchAllFiles();

//         // Initialize an object to hold directories
//         const directories = {};

//         // Separate files into directories and files
//         allFiles.forEach(file => {
//             const filePathParts = file.path.split('/'); // Split the file path by '/'
//             const fileName = filePathParts.pop(); // Get the last part as file name
//             const dirPath = filePathParts.join('/'); // Join the remaining parts to form the directory path

//             // If the directory doesn't exist, initialize it
//             if (!directories[dirPath]) {
//                 directories[dirPath] = {
//                     files: [],
//                 };
//             }

//             // Push the file to the corresponding directory
//             directories[dirPath].files.push({ name: fileName, ...file });
//         });
        
//         // Render the labs.ejs view with directories data
//         res.render('labs', { directories });
//     } catch (error) {
//         console.error('Error fetching files:', error);
//         res.status(500).json({ message: 'Error fetching files' });
//     }
// }

// // Function to get the content of a specific file
// async function getFileContent(req, res) {
//     const filePath = req.params[0];  // Get the captured path from the wildcard

//     try {
//         // Fetch the content of the specific file
//         const content = await fetchFileContent(filePath.trim()); // Ensure any leading/trailing spaces are removed

//         // Send the file content as a response
//         res.send(content);
//     } catch (error) {
//         console.error(`Error fetching content for file ${filePath}:`, error);
//         res.status(500).send('Error fetching file content');
//     }
// }

// module.exports = { getAllFiles, getFileContent };
