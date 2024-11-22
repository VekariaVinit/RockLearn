import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { marked } from 'marked';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

const LabDetails = () => {
    const { repoName } = useParams();
    const [directories, setDirectories] = useState({});
    const [fileContent, setFileContent] = useState('');
    const [fileType, setFileType] = useState('text');
    const [openDirectory, setOpenDirectory] = useState(null);
    const [fileName, setFileName] = useState('');
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const getToken = () => {
        return localStorage.getItem('TOKEN');
    };

    useEffect(() => {
        const fetchLabData = async () => {
            try {
                const token = getToken();
                const response = await fetch(`http://localhost:3001/lab/${repoName}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setDirectories(data.directories);
            } catch (error) {
                console.error('Error fetching lab details:', error);
            }
        };

        fetchLabData();
    }, [repoName]);

    const getFileType = (filePath) => {
        const ext = filePath.split('.').pop().toLowerCase();
        if (['txt', 'md', 'js', 'html', 'jsx'].includes(ext)) return 'text';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
        if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
        if (['pdf'].includes(ext)) return 'pdf';
        return 'unknown';
    };

    const fetchFileContent = async (filePath, download_url) => {
        const type = getFileType(filePath);
        setFileType(type);
        setFileName(filePath.split('/').pop());

        if (type === 'image') {
            setFileContent(`<img src="${download_url}" alt="Image" class="max-w-full h-auto rounded" />`);
        } else if (type === 'video') {
            setFileContent(
                `<video controls class="max-w-full h-auto rounded"><source src="${download_url}" type="video/mp4">Your browser does not support the video tag.</video>`
            );
        } else if (type === 'pdf') {
            setFileContent(`<iframe src="${download_url}" width="100%" height="600px" class="rounded border-2 border-gray-300"></iframe>`);
        } else {
            try {
                const response = await fetch(download_url);
                if (response.ok) {
                    const content = await response.text();
                    setFileContent(formatContent(content, type));
                } else {
                    setFileContent('Error fetching file content');
                }
            } catch (error) {
                setFileContent('Error fetching file content');
            }
        }
    };

    const formatContent = (content, type) => {
        if (type === 'text' && content.startsWith('{')) {
            try {
                const json = JSON.parse(content);
                return `<pre>${JSON.stringify(json, null, 2)}</pre>`;
            } catch {
                return `<pre>${content}</pre>`;
            }
        } else if (type === 'text') {
            return marked(content);
        } else if (type === 'md') {
            return (
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        a: ({ href, children }) => {
                            if (href.startsWith('http')) {
                                return (
                                    <a href={href} target="_blank" rel="noopener noreferrer">
                                        {children}
                                    </a>
                                );
                            }
                            return <Link to={href}>{children}</Link>;
                        },
                    }}
                >
                    {content}
                </ReactMarkdown>
            );
        } else {
            return `<pre>${content}</pre>`;
        }
    };

    const toggleDirectory = (dir) => {
        setOpenDirectory(openDirectory === dir ? null : dir);
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(`http://localhost:3001/download/${repoName}/${fileName}`);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Header />
            <div className="flex-grow relative flex pt-2 md:pt-0">
                {/* Sidebar */}
                <div
                    className={`sidebar bg-white border-r p-4 shadow-lg w-64 h-full overflow-y-auto fixed md:relative z-10 transition-transform duration-300 transform ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'
                        } md:translate-x-0`}
                >
                    <button
                        onClick={toggleSidebar}
                        className="text-lg text-gray-500 md:hidden absolute top-4 right-4"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <h2 className="text-2xl font-semibold mb-4">Directories</h2>
                    {Object.keys(directories).map((dir) => (
                        <div key={dir} className="mb-4">
                            <h3
                                className="text-xl font-bold cursor-pointer flex justify-between items-center"
                                onClick={() => toggleDirectory(dir)}
                            >
                                {dir === '' ? 'Root Directory' : dir}
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`transition-transform duration-300 ${openDirectory === dir ? 'rotate-180' : ''
                                        }`}
                                />
                            </h3>
                            <div
                                className={`transition-all duration-300 overflow-hidden ${openDirectory === dir ? 'max-h-screen' : 'max-h-0'
                                    }`}
                            >
                                <ul className="list-disc pl-4">
                                    {directories[dir].files.map((file) => (
                                        <li
                                            key={file.path}
                                            className="cursor-pointer text-blue-500 hover:underline"
                                            onClick={() => fetchFileContent(file.path, file.download_url)}
                                        >
                                            {file.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="content-area bg-white p-4 flex-grow shadow-lg rounded-md overflow-auto relative">
    {/* Header Section with Hamburger Menu */}
    <div className="flex justify-between items-center">
        {/* Hamburger Menu */}
        <button
            onClick={toggleSidebar}
            className="md:hidden bg-blue-500 text-white rounded-full p-3"
        >
            <FontAwesomeIcon icon={faBars} />
        </button>

        {/* Header Title */}
        <h2 className="text-2xl font-semibold flex-grow text-center md:text-left">
            File Content
        </h2>

        {/* Download Button */}
        <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
            Download File
        </button>
    </div>

    {/* File Content */}
    <div
        id="file-content"
        className="whitespace-pre-wrap border p-4 rounded-md bg-gray-50 mt-2"
    >
        {fileType === 'text' || fileType === 'md' ? (
            <div dangerouslySetInnerHTML={{ __html: fileContent }} />
        ) : (
            <div dangerouslySetInnerHTML={{ __html: fileContent }} />
        )}
    </div>
</div>



            </div>
        </div>
    );
};

export default LabDetails;
