// auth.js

export function retrieveData(callback){
    chrome.identity.getAuthToken(function(token){
        if(chrome.runtime.lastError || !token) {
            console.error('Error retrieving auth token:', chrome.runtime.lastError);
        } else {
              // Send token to your backend
            fetch('http://localhost:3000/authenticate', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then((data) => {
                callback(data);
            })
            .catch(error => {
                console.error('Error authenticating user:', error);
            });
        }
    });
}

export function updateGrid(grid){
    chrome.identity.getAuthToken(function(token){
        if(chrome.runtime.lastError || !token) {
            console.error('Error retrieving auth token:', chrome.runtime.lastError);
        } else {
            // Send token to backend
            fetch('http://localhost:3000/update-object', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(grid)
            })
            .then(response => response.json())
            .catch(error => {
                console.error('Error authenticating user:', error);
            });
        }
    })
}