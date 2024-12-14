// auth.js

export async function retrieveData(){
    try {
        const token = await new Promise((resolve, reject) => {
            chrome.identity.getAuthToken(function(token) {
                if(chrome.runtime.lastError || !token) {
                    reject(new Error(chrome.runtime.lastError?.message || 'Failed to get auth token'));
                } else {
                    resolve(token);
                }
            });
        });
    
        const res = await fetch('http://localhost:3000/authenticate', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            }
        });
    
        if(!res.ok) {
            console.error('**ERROR: Server returned status:', res.status);
        }
    
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error authenticating user:', err);
    }
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