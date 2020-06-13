const mongoose = require('mongoose');
const users = require('./API/User');// User Router
const express = require('express');
const app = express();

// Connect To MongoDB Atlas Database
mongoose.connect('mongodb+srv://@informedcluster-mlyol.mongodb.net/test?retryWrites=true&w=majority', 
{
    dbName: 'Users',
    user: 'jeremiah123',
    pass: 'jeremiah123',
    useNewUrlParser: true, 
    useUnifiedTopology: true
}
)
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

// Output Json
app.use(express.json());
// Use User Router  
app.use('/', users);

// Default port 3000 if not set
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));