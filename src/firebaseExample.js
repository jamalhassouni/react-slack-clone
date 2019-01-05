import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
// Initialize Firebase
var config = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_APP_NAME.firebaseapp.com",
  databaseURL: "https://YOUR_APP_NAME.firebaseio.com",
  projectId: "YOUR_APP_NAME",
  storageBucket: "YOUR_APP_NAME.appspot.com",
  messagingSenderId: "YOUR_MESSAGE_SENDER_ID"
};
firebase.initializeApp(config);

export default firebase;
