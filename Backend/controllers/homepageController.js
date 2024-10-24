// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();

// const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
// const GITHUB_USERNAME = process.env.GITHUB_UNAME;

// // Route to fetch repositories and render the homepage
// async function getRepoList(req, res) {
//   try {
//     // Fetch repositories using GitHub API
//     const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);
//     const repositories = response.data;

//     // Extract only the repository names
//     const repoNames = repositories.map(repo => repo.name);

//     // Render the EJS template and pass repository names and GitHub username
//     res.render('home', { repoNames, GITHUB_USERNAME });
//   } catch (error) {
//     console.error('Error fetching repositories:', error);
//     res.status(500).send('An error occurred while fetching repositories.');
//   }
// }

// // Route to create a new repository
// async function createLab(req, res) {
//   const { labName } = req.body;
//   const folderPath = req.files.folder;

//   try {
//     // Create a new repository on GitHub
//     const repoResponse = await axios.post(
//       `https://api.github.com/user/repos`,
//       {
//         name: labName,
//         private: false, // Set to 'true' if you want the repo to be private
//       },
//       {
//         headers: {
//           Authorization: `token ${GITHUB_TOKEN}`,
//           Accept: 'application/vnd.github.v3+json',
//         },
//       }
//     );

//     // Upload the folder structure to GitHub repository
//     const uploadFolder = async (folder, repoName, pathPrefix = '') => {
//       console.log(folder);
//       for (let file of folder) {
//         const filePath = path.join(__dirname, file.name);
//         const content = fs.readFileSync(filePath, 'base64'); // Read the file content

//         await axios.put(
//           `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${pathPrefix}${file.name}`,
//           {
//             message: `add ${file.name}`,
//             content: content,
//           },
//           {
//             headers: {
//               Authorization: `token ${GITHUB_TOKEN}`,
//             },
//           }
//         );
//       }
//     };

//     await uploadFolder(folderPath, labName);

//     res.redirect('/');
//   } catch (error) {
//     console.error('Error creating repository:', error);
//     res.status(500).send('An error occurred while creating the repository.');
//   }
// }

// module.exports = { getRepoList, createLab };


const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_UNAME;

// Route to fetch repositories and send JSON response
async function getRepoList(req, res) {
  try {
    // Fetch repositories using GitHub API
    const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);
    const repositories = response.data;

    // Extract only the repository names
    const repoNames = repositories.map(repo => repo.name);

    // Send JSON response with repository names and username
    res.json({ repoNames, GITHUB_USERNAME });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ message: 'An error occurred while fetching repositories.', error: error.message });
  }
}

// Route to create a new repository and send JSON response
async function createLab(req, res) {
  const { labName } = req.body;
  const folderPath = req.files.folder;

  try {
    // Create a new repository on GitHub
    const repoResponse = await axios.post(
      `https://api.github.com/user/repos`,
      {
        name: labName,
        private: false, // Set to 'true' if you want the repo to be private
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    // Upload the folder structure to GitHub repository
    const uploadFolder = async (folder, repoName, pathPrefix = '') => {
      console.log(folder);
      for (let file of folder) {
        const filePath = path.join(__dirname, file.name);
        const content = fs.readFileSync(filePath, 'base64'); // Read the file content

        await axios.put(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${pathPrefix}${file.name}`,
          {
            message: `add ${file.name}`,
            content: content,
          },
          {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
            },
          }
        );
      }
    };

    await uploadFolder(folderPath, labName);

    // Send success response with repository details
    res.json({ message: 'Repository created successfully', repoName: labName });
  } catch (error) {
    console.error('Error creating repository:', error);
    res.status(500).json({ message: 'An error occurred while creating the repository.', error: error.message });
  }
}

module.exports = { getRepoList, createLab };
