const fetch = require('node-fetch');

const BASE_URL = 'https://api.github.com/repos/Dhaval2908/ASE__/contents';

// Recursive function to fetch all files in a directory and its subdirectories
async function fetchAllFiles(dirPath = '') {
    const url = `${BASE_URL}/${dirPath}?ref=main`;
    let allFiles = [];

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error fetching directory contents');
        }
        const files = await response.json();

        for (const file of files) {
            if (file.type === 'file') {
                allFiles.push(file); // Add file to the list
            } else if (file.type === 'dir') {
                // Recursive call for subdirectory
                const subFiles = await fetchAllFiles(`${dirPath}/${file.name}`);
                allFiles = allFiles.concat(subFiles); // Add subdirectory files
            }
        }
    } catch (error) {
        console.error(error);
    }

    return allFiles;
}

// Function to fetch the content of a specific file
async function fetchFileContent(filePath) {
    const url = `https://raw.githubusercontent.com/Dhaval2908/ASE__/main/${filePath}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error fetching file content');
        }
        const content = await response.text();
        return content;
    } catch (error) {
        console.error(error);
        return null;
    }
}

module.exports = { fetchAllFiles, fetchFileContent };
