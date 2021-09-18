import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet,Image,TextInput,KeyboardAvoidingView,ToastAndroid} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import firebase from 'firebase';
import db from '../config';

class BookTransaction extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedStudentId: '',
      scannedBookId:'',
      buttonState: 'normal',
     
    };
  }

  getCameraPermission = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermissions: status === "granted",
      buttonState: id,
      scanned:false
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    var id=this.state.buttonState
    if(id==='studentId'){
        this.setState({
      scanned: true,
      scannedStudentId: data,
      buttonState: 'normal',
    });
    }
    else if(id==='bookId'){
       this.setState({
      scanned: true,
      scannedBookId: data,
      buttonState: 'normal',
    });
    }
   
  };

  handleTransaction=async()=>{
   var transactionMessage;
    db.collection("books").doc(this.state.scannedBookId).get()
    .then((doc)=>{
      var book=doc.data();
      console.log(book.bookAvailability)
      if(book.bookAvailability){
          this.initiateBookIssue();
          transactionMessage="Book Issued"
          ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
      }
      else{
         this.initiateBookReturn();
        transactionMessage="Book Returned"
         ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
      }
      
    })
  }
  initiateBookIssue=async ()=>{
  db.collection("transaction").add({
    'studentId':this.state.scannedStudentId,
    'bookId':this.state.scannedBookId,
    'date':firebase.firestore.Timestamp.now().toDate(),
    'transactionType':'Issue'
  })
  db.collection("books").doc(this.state.scannedBookId).update({
    'bookAvailability':false
  })
  db.collection("students").doc(this.state.scannedStudentId).update({
    'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
  })
 
  this.setState({
    scannedBookId:'',
    scannedStudentId:''
  })
console.log('Function called!')
  }
  initiateBookReturn=async ()=>{
     db.collection("transaction").add({
    'studentId':this.state.scannedStudentId,
    'bookId':this.state.scannedBookId,
    'date':firebase.firestore.Timestamp.now().toDate(),
    'transactionType':'Return'
  })
  db.collection("books").doc(this.state.scannedBookId).update({
    'bookAvailability':true
  })
  db.collection("students").doc(this.state.scannedStudentId).update({
    'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
  })
 
  this.setState({
    scannedBookId:'',
    scannedStudentId:''
  })

  }
  render() {
    const cp = this.state.hasCameraPermissions;
    const bs = this.state.buttonState;
    const scanned = this.state.scanned;

    if (bs !== 'normal' && cp) {
      
      return (
        
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
      );
    } else if (bs === 'normal') {
      return (
       
     
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <Image source={require('../assets/library.jpg')} 
        style={{width:200,height:200,alignSelf:'center',marginTop:80}}/>

        <View style={[styles.scan1,{marginTop:10,alignSelf:'center'}]}>
            <TextInput style={styles.input}
            placeholder='Book Id'
            onChangeText={(input)=>{
              this.setState({scannedBookId:input})
            }}
            value={this.state.scannedBookId}
            >
          </TextInput>
           <TouchableOpacity
            style={styles.button}
            onPress= {()=>{this.getCameraPermission('bookId')}}>
            <Text>Scan</Text>
          </TouchableOpacity>
        </View>
          <View style={[styles.scan1,{alignSelf:'center'}]}>
          <TextInput style={styles.input}
          placeholder='Student Id'
             onChangeText={(input)=>{
              this.setState({scannedStudentId:input})
            }}
              value={this.state.scannedStudentId}>
          </TextInput>
          <TouchableOpacity
            style={styles.button}
            onPress= {()=>this.getCameraPermission('studentId')}>
            <Text>Scan</Text>
          </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={this.handleTransaction} style={styles.submit}>
            <Text>Submit</Text>
          </TouchableOpacity>
          </KeyboardAvoidingView>
      

       
      );
    }
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'gray',
    width:100,
    height: 50,
    justifyContent:'center',
    alignItems:'center',
    marginTop: 50,
    alignSelf:'center',
    borderWidth:2,
    borderRadius:10
  },
  
  input:{
    marginLeft:20,
    marginTop:50,
    borderWidth:2,
    borderColor:'black',
    width:200,
    height:50,
    backgroundColor:'skyblue',
    borderRadius:10
  },

  scan1:{
    flexDirection:'row'
  },
  submit:{
    alignSelf:'center',
    marginTop:80,
    backgroundColor:'gray',
    height:50,
    width:100,
    alignItems:'center',
    justifyContent:'center',
    borderColor:'black',
    borderWidth:2,
    borderRadius:10
  },
  container:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  }
});

export default BookTransaction;
