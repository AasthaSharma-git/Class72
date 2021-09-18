import firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyDjqZ8M1eJ68vRJ-Jds1-e53uItnM7lJQM",
  authDomain: "wily-b552b.firebaseapp.com",
  projectId: "wily-b552b",
  storageBucket: "wily-b552b.appspot.com",
  messagingSenderId: "655971322297",
  appId: "1:655971322297:web:497c773ef7428a13480e68"
};

firebase.initializeApp(firebaseConfig);
export default firebase.firestore();