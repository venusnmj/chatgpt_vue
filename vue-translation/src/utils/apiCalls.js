export const GetSetup = async () => {
    return(
        {
            "excludedDirectories": ["node_modules", "bin", "obj", "target", "dist"],
            "excludedFileTypes": [".exe", ".dll", ".bin", ".class", ".jar", ".log", ".md", ".json", ".xml", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv", ".mp3", ".wav", ".flac", ".zip", ".tar", ".gz", ".rar", ".7z", ".sys", ".ini", ".bat", ".sh", ".pdf", ".ppt", ".pptx", ".xls", ".xlsx", ".ttf", ".otf", ".woff", ".woff2", ".bak", ".old", ".tmp", ".temp", ".vdi", ".vmdk", ".vhd"],
            "logoUrl": "src/assets/7clawlogo.png",
            "websiteName": "AI代码翻译",
            "languageOptions": ["English", "Spanish", "French"],
            "totalUser": 1000,
            "totalFilesTranslated": 500
        }
    );
};

export const GetUserIp = async () => {
    return(
        {
            "userIp": "12345"
        }
    );
}

export const PutUserId = async ( userIp, userDev, curDate) => {
    const userId = userIp + userDev + curDate;
    return userId;
    // I ownself store locally and only send userId during GetHistory() and TranslateFile()
    // userId is for local reference
}

export const GetHistory = async (userId) => {
    return(
        [
        {
            "fileId": "file1",
            "filePath": "/path/to/file1.txt"
        },
        {
            "fileId": "file2",
            "filePath": "/path/to/file2.txt"
        },
        {
            "fileId": "file3",
            "filePath": "/path/to/file3.txt"
        }
        ]
    );
}

//userFiles consist of userId and filesList
export const GetTranslatable = async ( userFiles ) => {
    return(
            [
                {
                    "fileId": "file1",
                    "filePath": "simpleTest/test1_python.py"
                },
                {
                    "fileId": "file2",
                    "filePath": "simpleTest/test1.java"
                },
                {
                    "fileId": "file3",
                    "filePath": "simpleTest/zuccini/sql.sql"
                }
            ]
    );
}

export const SendFile = async ( file, lang, fileId, filePath, userId) => {
    return(
        {
            "fileId": "file1",
            "status": "submitted"
        }
    );
}

export const PollingFile = async (fileId) => {
    return(
        {
            "fileId": "file1",
            "status": "submitted"
        }
    );
}

export const RetryFile = async (fileId, file, lang, filePath) => {
    //fileId for 500
    //fileId, file, lang, filePath for 400
    return(
        {
            "fileId": "file1",
            "status": "submitted"
        }
    );
}

export const GetTranslation = async (fileId) => {
    return(
        {
            "fileContent": "translated code here"
        }
    )
}
