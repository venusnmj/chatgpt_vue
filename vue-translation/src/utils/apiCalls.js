export const GetSetup = async () => {
    try {
      const response = await fetch('http://192.168.31.6:8080/public/website-info');
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
    const response = await fetch('http://192.168.31.6:8080/public/get-ip', {
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

        const response = await fetch(`http://192.168.31.6:8080/public/${uid}/create`, {
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
        const response = await fetch('http://192.168.31.6:8080/authenticate/user', {
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
        const response = await fetch(`http://192.168.31.6:8080/user/files/${uid}/file-names`, {
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
        const response = await fetch(`http://192.168.31.6:8080/user/files/${uid}/upload`, {
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
export const SendFile = async (uid, filesData, jwtToken, targetLanguage, modelNames) => {
    const url = `http://192.168.31.6:8080/user/translate/${uid}/upload`;
    const formData = new FormData();

    filesData.forEach(fileData => {
        console.log('im here');
        formData.append('files', fileData.file); // 'file' part
        formData.append('ids', fileData.id); // 'id' part
        formData.append('filePaths', fileData.filePath); // 'filePath' part
    });

    for (var pair of formData.entries()) {
        console.log('sendFiles ' + pair[0] + ': ' + pair[1]); 
    }


    formData.append('modelName', modelNames);

    formData.append('targetLanguage', targetLanguage); // Correct parameter name

    for (var pair of formData.entries()) {
        console.log('sendFiles ' + pair[0] + ': ' + pair[1]); 
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
    const url = `http://192.168.31.6:8080/user/translate/${uid}/status`;
    const params = new URLSearchParams({ id: fileId, modelName: modelName });

    try {
        const response = await fetch(`${url}?${params}`, {
            method: 'PUT',
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

export const GetTranslation = async (uid, fileId, jwtToken, modelName) => {
    const url = `http://192.168.31.6:8080/user/translate/${uid}/content`;
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
        const response = await fetch('http://192.168.31.6:8080/public/website-info/ai-list');
    
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

