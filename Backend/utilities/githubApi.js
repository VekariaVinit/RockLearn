const fetch = require("node-fetch");

require("dotenv").config();
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

// Recursive function to fetch all files in a directory and its subdirectories
async function fetchAllFiles(repoName, dirPath = "") {
  const BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents`;
  const url = `${BASE_URL}/${dirPath}?ref=main`;
  let allFiles = [];

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error fetching directory contents");
    }
    const files = await response.json();

    for (const file of files) {
      if (file.type === "file") {
        allFiles.push(file);
      } else if (file.type === "dir") {
        const subFiles = await fetchAllFiles(
          repoName,
          `${dirPath}/${file.name}`
        );
        allFiles = allFiles.concat(subFiles);
      }
    }
  } catch (error) {
    console.error(error);
  }

  return allFiles;
}
async function fetchLabMetadata(repoName) {
  const metadata = {
    title: repoName,
    url: `https://github.com/${GITHUB_USERNAME}/${repoName}`,
  };
  return metadata;
}

// Function to fetch the content of a specific file
async function fetchFileContent(repoName, filePath) {
  // Construct the URL using the passed repoName
  const url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/main/${filePath}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error fetching file content");
    }
    const content = await response.text();
    return content;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = { fetchAllFiles, fetchFileContent };
