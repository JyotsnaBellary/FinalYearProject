const express = require('express'); //Import the express dependency
const app = express();  
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser');            //Instantiate an express app, the main work horse of this server
const status = require('statuses');
const port = 5000;   //Save the port number where your server will be listening
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'hjfgesdhbsjdbhjfvd@#$%^&&^%$#sjhvsdfhvdhjvfvbsdbfvsdjvbfvbfbfdjvbsdnvdvd'

const mongoose = require('mongoose')
const User = require('./model/user');
const { json } = require('body-parser');
mongoose.connect('mongodb://localhost:27017/login-app-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
    
})

// app.use('/', express.static(path.join(__dirname, 'templates')))

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    res.sendFile('/templates/Register.html', {root: __dirname});      //server responds by sending the Resgister.html file to the client's browser//the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 

});

app.get('/login', (req, res) => {        //get requests to the root ("/") will route here
    res.sendFile('/templates/login.html', {root: __dirname});      //server responds by sending the Resgister.html file to the client's browser//the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

// Client -> Server: , Client has to authenticate who it is
//Why: Server is a central comp you can't control
// client -> a comp you do not control
//1. Client proves itself (using jwt)
// 2. Client-server share a secret (using cookies)


app.use(bodyParser.json())

app.post('/api/login', async (req, res) => {
	const { name,email, password } = req.body
	const user = await User.findOne({ email }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		const token = jwt.sign(
			{
				id: user._id,
				username: user.email
			},
			JWT_SECRET
		)

		return res.json({ status: 'ok', data: token })
	}

	res.json({ status: 'error', error: 'Invalid username/password' })
})


app.post('/api/register', async (req,res) => {
    

    // Hashing the passwords using bcrypt
    // console.log('hello')

    const { name,email, password: plainTextPassword} = req.body

    if(!name || typeof name !== 'string'){
        return res.json({ status: 'error', error: 'Invalid Username' })
    }
    if(!email || typeof email !== 'string'){
        return res.json({ status: 'error', error: 'Invalid Email' })
    }
    if(!plainTextPassword || typeof plainTextPassword !== 'string'){
        return res.json({ status: 'error', error: 'Invalid Password' })
    }
    if (plainTextPassword.length < 5) {
        return res.json({ status: 'error',
                          error: 'Password too small. Should be atleast six charachters' 
        })
    }

    const password = await bcrypt.hash(plainTextPassword, 10)
    console.log(await bcrypt.hash(password, 10))
    // console.log(password) // not working

    try{
        const response = await User.create({
            name,
            email,
            password
        })
        console.log('User created successfully',response)
    }catch(error){
        // console.log(JSON.stringify(error))
        if (error.code === 11000){
            return res.json({ status: 'error', error: 'Email already exists.' })
        }
        throw error
    }


    
    res.json({status: 'ok' })
})


app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`); 
});