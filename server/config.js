const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyCDj6goTGPvlauzEPJiboKoZB56rIQa9Uo",
    authDomain: "gamified-productivity-ap-c0e8a.firebaseapp.com",
    projectId: "gamified-productivity-ap-c0e8a",
    storageBucket: "gamified-productivity-ap-c0e8a.appspot.com",
    messagingSenderId: "195143434013",
    appId: "1:195143434013:web:de1dc9485a49de3d44abf4",
    measurementId: "G-8X1Y03RHLG"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const users = db.collection('Users');

module.exports = users;
