// app.js
import { initializeApp } from 'firebase/app';  // Firebase app initialization
import { getAuth } from 'firebase/auth';  // Firebase authentication
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'; // Firebase Firestore

// Express setup
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const firebaseConfig = {
    apiKey: "AIzaSyCDj6goTGPvlauzEPJiboKoZB56rIQa9Uo",
    authDomain: "gamified-productivity-ap-c0e8a.firebaseapp.com",
    projectId: "gamified-productivity-ap-c0e8a",
    storageBucket: "gamified-productivity-ap-c0e8a.appspot.com",
    messagingSenderId: "195143434013",
    appId: "1:195143434013:web:de1dc9485a49de3d44abf4",
    measurementId: "G-8X1Y03RHLG"
};

const firebaseapp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseapp);
const db = getFirestore(firebaseapp);

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello, Firebase with Express!');
});

const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split(' ')[1];
    if (!idToken) return res.status(403).send('Unauthorized');
    try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${idToken}`);
        const tokenInfo = await response.json();

        if (tokenInfo.aud !== "20118193498-6c6ct9liu1de2gn86721fp3vgpshdlok.apps.googleusercontent.com") {
            return res.status(401).send('Invalid token audience');
        }
        
        req.user = tokenInfo;
        next();
    } catch (err) {
        res.status(401).send('Token verification failed');
    }
};

app.post('/authenticate', verifyToken, async (req,res) => {
    const { sub, email } = req.user;

    try {
        const userDocRef = doc(db, 'users', sub);
        const docSnapshot = await getDoc(userDocRef);

        if(!docSnapshot.exists()) {
            const defaultval = {
                email: email,
                sub: sub,
                numCharacters: 1,
                gridData: Array.from({ length: 18 }, () => Array(18).fill('null'))
            }
            await setDoc(userDocRef, defaultval, { merge: true });
            return res.status(200).json(defaultval);
        } else {
            console.log('Doc already exists');
            return res.status(200).json(docSnapshot.data());
        }
    } catch (err) {
        console.error('Error checking or creating document:', err);
    }
});

app.post('/update-object', verifyToken, async (req, res) => {
    const { sub, email } = req.user;
    const gridraw = req.body;
    const grid = gridraw.map(row => JSON.stringify(row));

     try {
        const userDocRef = doc(db, 'users', sub);
        const docSnapshot = await getDoc(userDocRef);

        if(docSnapshot.exists()) {
            const gridval = {
                gridData: grid
            }
            console.log(gridval);
            await setDoc(userDocRef, gridval, { merge: true });
            console.log('grid updated');
            return res.status(200).json(docSnapshot.data());
        }
     } catch (err) {
        console.error('Error checking or creating document:', err);
 
     }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

