    const fetch = require('node-fetch');

    require("dotenv").config();
    const GITHUB_USERNAME = process.env.GITHUB_UNAME;

    // Recursive function to fetch all files in a directory and its subdirectories
    async function fetchAllFiles(repoName, dirPath = '') {
        // Construct the BASE_URL using the passed repoName
        const BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents`;
        const url = `${BASE_URL}/${dirPath}?ref=main`; // Construct the URL for fetching directory contents
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
                    const subFiles = await fetchAllFiles(repoName, `${dirPath}/${file.name}`); // Pass repoName in the recursive call
                    allFiles = allFiles.concat(subFiles); // Add subdirectory files
                }
            }
        } catch (error) {
            console.error(error);
        }

        return allFiles;
    }


    // Function to fetch the content of a specific file
    async function fetchFileContent( repoName,filePath) {
        // Construct the URL using the passed repoName
        const url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/main/${filePath}`;

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
