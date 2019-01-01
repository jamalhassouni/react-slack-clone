import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
// Initialize Firebase
var config = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: ""
};
firebase.initializeApp(config);

export default firebase;
