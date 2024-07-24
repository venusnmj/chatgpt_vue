export const GetSetup = async () => {
    try {
      const response = await fetch('http://54.222.203.90:8080/public/website-info');
    // const response = await fetch('/api/public/website-info');

  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      return {
        excludedDirectories: data.excludedDirectories !== "Error fetching data" ? data.excludedDirectories : [],
        excludedFileTypes: data.excludedFileTypes !== "Error fetching data" ? data.excludedFileTypes : [],
        logoUrl: data.logoUrl !== "Error fetching data" ? data.logoUrl : '',
        websiteName: data.websiteName !== "Error fetching data" ? data.websiteName : '',
        languageOptions: data.languageOptions !== "Error fetching data" ? data.languageOptions : [],
        totalUser: data.totalUser !== "Error fetching data" ? data.totalUser : 0,
        totalFilesTranslated: data.totalFilesTranslated !== "Error fetching data" ? data.totalFilesTranslated : 0
      };
    } catch (error) {
      console.error('Error fetching setup data:', error);
      return {
        excludedDirectories: [],
        excludedFileTypes: [],
        logoUrl: '',
        websiteName: '',
        languageOptions: [],
        totalUser: 0,
        totalFilesTranslated: 0
      };
    }
    // return {
    //    excludedDirectories: ["/dir1", "/dir2"],
    //    excludedFileTypes: [".jpg", ".png"],
    //    logoUrl: "http://example.com/logo.png",
    //    websiteName: "Example Website",
    //    languageOptions: ["en", "es", "fr"],
    //    totalUser: 1234,
    //    totalFilesTranslated: 5678
    // };
  };
  
  
  export const GetUserIp = async () => {
  try {
    const response = await fetch('http://54.222.203.90:8080/public/get-ip', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data.ipAddress); 
    return data.ipAddress;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    throw error;
  }
// return ({    
//     ipAddress: "192.168.1.1"
// });
};


export const PutUserId = async (uid, ipAddress) => {
    console.log("uid: " + uid);
    try {
        const formData = new FormData();
        formData.append("ipAddress", ipAddress);

        console.log("Form Data: " + formData.get("ipAddress"));

        const response = await fetch(`http://54.222.203.90:8080/public/${uid}/create`, {
            method: 'POST',
            body: formData
        });

        const responseText = await response.text();
        console.log("Response Text: " + responseText);

        if (!response.ok) {
            console.error('HTTP error! Status: ' + response.status);
            if (response.status === 500) {
                return { success: false, error: 'Internal server error: ' + responseText };
            } else if (response.status === 400) {
                return { success: false, error: 'Bad request: ' + responseText };
            } else {
                return { success: false, error: 'Unexpected error: ' + responseText };
            }
        }

        const data = JSON.parse(responseText);
        console.log('User created successfully:', data.uid);
        return { success: true, uid: data.uid };
    } catch (error) {
        console.error('Error making API request:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
};


export const AuthenticateUser = async (uid) => {
    try {
        const response = await fetch('http://54.222.203.90:8080/authenticate/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid }), // Send the UID in the request body
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Authentication successful, JWT:', data.jwt);
        return { success: true, jwt: data.jwt }; // Return the JWT if successful
    } catch (error) {
        console.error('Error authenticating user:', error);
        return { success: false, error: 'An unexpected error occurred.' }; // Return an error message if the request fails
    }
    // return (
    //     { success: true, 
    //         jwt: "eyJhbGciOiJIUzI1NiJ9..." }
    //   );
    
};


export const GetHistory = async ( uid, jwt) => {
    try {
        const response = await fetch(`http://54.222.203.90:8080/user/files/${uid}/file-names`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.text();
        console.log('Get History Success:', data);
        return data ; 
    } catch (error) {
        console.error('Error getting history:', error);
        return { success: false, error: 'An unexpected error occurred.' }; // Return an error message if the request fails
    }
    // return ([    
    //     {
    //         "fileId": "fileId1",
    //         "filePath": "file/path/1.txt"
    //     },
    //     {
    //         "fileId": "fileId2",
    //         "filePath": "file/path/2.txt"
    //     }
    // ]);
    
};


//userFiles consist of userId and filesList
export const GetTranslatable = async (uid, userFiles, jwt) => {
    console.log(userFiles); 
    try {
        const response = await fetch(`http://54.222.203.90:8080/user/files/${uid}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(userFiles), 
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Get Translatable Success:', data);
        return data;
    } catch (error) {
        console.error('Error getting translatable:', error.message);
        return { success: false, error: 'An unexpected error occurred.' + error.message };
    }

    // return(
    //         [
    //             {
    //                 "fileId": "file1",
    //                 "filePath": "simpleTest/test1_python.py"
    //             },
    //             {
    //                 "fileId": "file2",
    //                 "filePath": "simpleTest/test1.java"
    //             },
    //             {
    //                 "fileId": "file3",
    //                 "filePath": "simpleTest/zuccini/sql.sql"
    //             }
    //         ]
    // );
}


// This funciton must have better error handling 

// the response status code doesnt tell you anything meaningful,
// the structure of the response is a array of json object with  { id, modelName status, status code} 
// the status code of each individual files tell us whether that id +/ modelName is taken / rate limited / internal sever error 
// export const SendFile = async (uid, filesData, jwtToken, targetLanguage, modelNames, reqArr) => {
//     console.log('request arr '+ JSON.stringify(reqArr));
//     const url = `http://54.222.203.90:8080/user/translate/${uid}/upload`;
//     const formData = new FormData();

//     filesData.forEach(fileData => {
//         // console.log('im here');
//         formData.append('files', fileData.file); // 'file' part
//         formData.append('ids', fileData.id); // 'id' part
//         formData.append('filePaths', fileData.filePath); // 'filePath' part
//     });

//     formData.append('modelName', modelNames);

//     formData.append('targetLanguage', targetLanguage); // Correct parameter name

//     if (reqArr) {
//         for (const [id, instruction] of Object.entries(reqArr)) {
//             console.log(id + " " + instruction);
//             formData.append(`specialInstructions[${id}]`, `${instruction}`);
//         }
//     }

//     for (var pair of formData.entries()) {
//         console.log('sendFiles ' + pair[0] + ': ' + pair[1]); 
//     }

//     try {
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${jwtToken}`,
//             },
//             body: formData
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
//         }

//         const data = await response.json(); // Assuming the response is JSON
//         console.log('Upload Success:', data);
//         return data;
//     } catch (error) {
//         console.error('Error uploading files:', error.message);
//         return { success: false, error: error.message };
//     }
// };

export const SendFile = async (uid, filesData, jwtToken, targetLanguage, modelNames, reqArr) => {
    console.log('Request Array:', JSON.stringify(reqArr));
    const url = `http://54.222.203.90:8080/user/translate/${uid}/upload`;
    const formData = new FormData();

    // Append files, ids, and filePaths to the formData
    filesData.forEach(fileData => {
        formData.append('files', fileData.file); // 'file' part
        formData.append('ids', fileData.id); // 'id' part
        formData.append('filePaths', fileData.filePath); // 'filePath' part
    });

    // Append model names
    modelNames.forEach(modelName => {
        formData.append('modelName', modelName);
    });

    // Append target language
    formData.append('targetLanguage', targetLanguage);

    // Append special instructions if provided
    if (reqArr && Object.keys(reqArr).length > 0) {
        Object.entries(reqArr).forEach(([id, instruction]) => {
            formData.append(`specialInstructions[${id}]`, instruction);
            console.log("im appending " + instruction + " to this id: " + id)
        });
    }

    // Log the formData entries
    for (const pair of formData.entries()) {
        console.log('FormData Entry:', pair[0], pair[1]);
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json(); // Assuming the response is JSON
        console.log('Upload Success:', data);
        return data;
    } catch (error) {
        console.error('Error uploading files:', error.message);
        return { success: false, error: error.message };
    }
};




export const PollingFile = async (uid, fileId, jwtToken, modelName) => {
    const url = `http://54.222.203.90:8080/user/translate/${uid}/status`;
    const params = new URLSearchParams({ id: fileId, modelName: modelName });

    try {
        const response = await fetch(`${url}?${params}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(response);

        if (!response.ok) {
            
            if (response.status === 400) {
                throw new Error('Bad Request: Invalid parameters.');
            } else if (response.status === 404) {
                const errorData = await response.json();
                throw new Error(errorData.status || 'ID not found');
            } else if (response.status === 500){
                throw new Error('Internal server error');
            }
            else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('Update Status Success:', data);
        return data;
    } catch (error) {
        console.error('Error updating file status:', error.message);
        return { success: false, error: error.message };
    }
    // return(
    //     {
    //         "fileId": "file1",
    //         // "status": "processing",
    //         "status": "completed"
            
    //     }
    // );
};


// export const RetryFile = async (fileId, file, lang, filePath, modelName) => {
//     //fileId for 500 status code
//     //fileId, file, lang, filePath for 400 status code
//     return(
//         {
//             "fileId": "file1",
//             "status": "submitted"
//         }
//     );
// }

export const RetryFile = async (uid, jwtToken, fileId, modelName, file, filePath, lang, specialInstruction) => {
    const url = `http://54.222.203.90:8080/user/translate/${uid}/retry`;
    const formData = new FormData();

    // Append the necessary fields to the formData
    formData.append('id', fileId);
    formData.append('modelName', modelName);
    if (lang) formData.append('targetLanguage', lang);
    if (filePath) formData.append('filePath', filePath);
    if (specialInstruction) formData.append('specialInstruction', specialInstruction);
    if (file) formData.append('file', file);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Retry Success:', data);
        return data;
    } catch (error) {
        console.error('Error retrying file:', error.message);
        return { success: false, error: error.message };
    }
};


export const GetTranslation = async (uid, fileId, jwtToken, modelName) => {
    const url = `http://54.222.203.90:8080/user/translate/${uid}/content`;
    const params = new URLSearchParams({ id: fileId, modelName: modelName });

    try {
        const response = await fetch(`${url}?${params}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                const errorData = await response.json();
                throw new Error(errorData.status || 'ID not found');
            } else if (response.status === 406) {
                const errorData = await response.json();
                throw new Error('Translation not completed: ' + (errorData.content || ''));
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('Fetch Translated Content Success:', data);
        return data;
    } catch (error) {
        console.error('Error fetching translated content:', error.message);
        return { success: false, error: error.message };
    }
    // return(
    //     {
    //         "fileContent": "translated code here"
    //     }
    // )
};

export const GetModels = async () => {
    try {
        const response = await fetch('http://54.222.203.90:8080/public/website-info/ai-list');
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        // console.log('models: '+ JSON.stringify(data));
        return data;
      } catch (error) {
        console.error('Error fetching model data:', error);
        throw error;
      }
}

export const PollingHistory = async (uid, fileId, jwtToken) => {
    const url = `http://54.222.203.90:8080/user/translate/${uid}/get-files-translated-models`;
    const params = new URLSearchParams({ id: fileId });

    console.log("uid: " + uid + "\nfileId: " + fileId);
    try {
        const response = await fetch(`${url}?${params}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(response);

        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('Bad Request: Invalid parameters.');
            } else if (response.status === 404) {
                const errorData = await response.json();
                throw new Error(errorData.status || 'ID not found');
            } else if (response.status === 500){
                throw new Error('Internal server error');
            }
            else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('Polling History Status Success:', data.models);
        return data.models;
    } catch (error) {
        console.error('Error updating history status:', error.message);
        return { success: false, error: error.message };
    }
}


export const GetOriginal = async (uid, fileId, jwtToken) => {
    const url = `http://54.222.203.90:8080/user/translate/${uid}/get-original-content`;
    const params = new URLSearchParams({ id: fileId });

    console.log("uid: " + uid + "\nfileId: " + fileId);
    try {
        const response = await fetch(`${url}?${params}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('Bad Request: Invalid parameters.');
            } else if (response.status === 404) {
                const errorData = await response.json();
                throw new Error(errorData.status || 'ID not found');
            } else if (response.status === 500){
                throw new Error('Internal server error');
            }
            else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('Orignal content Success:', data.content);
        return data.content;
    } catch (error) {
        console.error('Error getting original content:', error.message);
        return { success: false, error: error.message };
    }
}

