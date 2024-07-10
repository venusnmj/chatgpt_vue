export const GetSetup = async () => {
    try {
      const response = await fetch('http://192.168.31.239:8080/public/website-info');
  
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
  };
  
  
  export const GetUserIp = async () => {
  try {
    const response = await fetch('http://192.168.31.239:8080/public/get-ip', {
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
};


// export const PutUserId = async ( userId ) => {
//     return userId;
// }

// export const PutUserId = async (uid, ipAddress) => {
//     try {
//       const response = await fetch(`http://192.168.31.239:8080/public/${uid}/create`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.parse(`{ "ipAddress" : ${ipAddress} }`) // Send the request body with ipAddress
//       });
  
//       if (response.ok) {
//         // Success response
//         const data = await response.json();
//         console.log('User created successfully:', data.uid); // Log the user ID for debugging
//         return { success: true, uid: data.uid };
//       } else if (response.status === 400) {
//         // UID taken
//         const data = await response.json();
//         console.error('Error creating user:', data.error);
//         return { success: false, error: 'UID taken' };
//       } else if (response.status === 500) {
//         // Internal server error
//         const data = await response.json();
//         console.error('Database operation error:', data.error);
//         return { success: false, error: data.error || 'An unexpected error occurred.' };
//       } else {
//         // Handle other status codes if necessary
//         console.error('Unexpected response status:', response.status);
//         return { success: false, error: 'An unexpected error occurred.' };
//       }
//     } catch (error) {
//       console.error('Error making API request:', error);
//       return { success: false, error: 'An unexpected error occurred.' };
//     }
//   };

export const PutUserId = async (uid, ipAddress) => {
    console.log("uid: " + uid);
    try {
        const formData = new FormData();
        formData.append("ipAddress", ipAddress);

        console.log("Form Data: " + formData.get("ipAddress"));

        const response = await fetch(`http://192.168.31.239:8080/public/${uid}/create`, {
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
        const response = await fetch('http://192.168.31.239:8080/authenticate/user', {
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
};


export const GetHistory = async ( uid, jwt) => {
    try {
        // console.log('history of '+ jwt)
        const response = await fetch(`http://192.168.31.239:8080/user/files/${uid}/file-names`, {
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
};


//userFiles consist of userId and filesList
export const GetTranslatable = async (uid, userFiles, jwt) => {
    console.log(userFiles); // Make sure this logs the correct array of strings
    try {
        const response = await fetch(`http://192.168.31.239:8080/user/files/${uid}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json', // Set the Content-Type header to application/json
            },
            body: JSON.stringify(userFiles), // Stringify the array of strings
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



export const SendFile = async (uid, filesData, jwtToken) => {
    const url = `http://192.168.31.239:8080/user/translate/${uid}/upload`;
    const formData = new FormData();

    // Append each file and its metadata to the FormData object
    filesData.forEach(fileData => {
        formData.append('files', fileData.file, fileData.filePath); // 'file' part
        formData.append('ids', fileData.id); // 'id' part
        formData.append('targetLanguages', fileData.targetLanguage); // 'targetLanguage' part
        formData.append('filePaths', fileData.filePath); // 'filePath' part
    });

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


// export const SendFile = async ( file, lang, fileId, filePath, userId) => {
//     return(
//         {
//             "fileId": fileId,
//             "status": "submitted"
//         }
//     );
// }

export const PollingFile = async (uid, fileId, jwtToken) => {
    const url = `http://192.168.31.239:8080/user/translate/${uid}/status`;
    const params = new URLSearchParams({ id: fileId });

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
            } else {
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
};



// export const PollingFile = async (fileId) => {
//     return(
//         {
//             "fileId": "file1",
//             // "status": "processing",
//             "status": "completed"
            
//         }
//     );
// } 

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

export const GetTranslation = async (uid, fileId, jwtToken) => {
    const url = `http://192.168.31.239:8080/user/translate/${uid}/content`;
    const params = new URLSearchParams({ id: fileId });

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
};


// export const GetTranslation = async (fileId) => {
//     return(
//         {
//             "fileContent": "translated code here"
//         }
//     )
// }
