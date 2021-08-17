const admin = require('firebase-admin')
const jwt = require('jsonwebstoken')
const creds = require('../credentials.json')
const { secret } = require('../../secrets')

function connectDb() {
    if (!admin.apps.length) { // check we havent already connected
       admin.initializeApp({
           credential: admin.credential.cert(creds)
       })
    }
    return admin.firestore()
}

exports.userSignup = (req, res) => {
    //check that email and pw present in the request
    if(!req.body || !req.body.email || !req.body.password){
        res.status(400).send({
            message: 'Invalid Request: missing email or password',
            status: 400,
            sucess: false
        })
        return
    }
//connect to db
const db = connectDb()
db.collection('users')
  .doc(req.body.email.toLowerCase())
  .set(req.body)
  .then(() => {
      const token = jwt.sign({ email: req.body.email}, secret)
      res.send({
        message: 'User created successfully',
        status: 400,
        success: true,
        token
      })
  })
  .catch(err => {
    res.status(500).send({
        message: 'Error:' + err.message,
        status: 500,
        success: false
    })
  })
}

exports.userLogin = (req, res) => {
    // check that email and pw are present in request
    if(!req.body || !req.body.email || !req.body.password) {
        res.status(400).send({
        message: 'Invalid Requests: missing email or password',
        status: 400,
        success: false
        })
        return
    }
    // if not return error
    // connect to DB
    const db = connectDb()
    // check to see if user exists with email and pw
    db.collection('users')
      .where('email', '==', req.body.email.toLowerCase())
      .where('password', '==', req.body.password)
      .get()
      .then(userCollection => {
          if(userCollection.docs.length) {
            let user = userCollection.docs[0].data()
            user.password = undefined
            //create token for the user
            const token = jwt.sign(user, secret)
            res.send({
                message: 'User logged in successfully',
                status: 200,
                success: true,
                token
            })
          } else {
              res.status(401).send({
                  message: 'Invalid email or password',
                  status: 401,
                  success: false
              })
      }
    })
    .catch(err => {
        res.status(500).send({
            message: 'Error',
            status: 500,
            success: false
        })
    })
    // return that user if it does
    // if not, return error
}
