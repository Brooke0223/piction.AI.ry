const express = require('express');
const router = express.Router();

// creating a GET request to our root route
// when I navigate to localhost3001 it will display "server is up and running"
router.get('/', (req, res) => {
    res.send('server is up and running');
});

module.exports = router;