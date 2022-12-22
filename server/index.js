let terms = require('./terms'); //this is importing all the words I will use!

const express = require('express');
const app = express();
const http  = require('http');
const { Server } = require('socket.io');
const cors = require('cors')



app.use(
    cors(
        {origin: '*'}
    ));

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
})


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})










// --------------------------------------------------------------------------------------------
const { addUser, removeUser, getUser, getUsersInRoom, getDrawingUserInRoom, getGuessingUserInRoom, getPartner, getRoom } = require('./users')


const getCurrentTime = () => {
    let secondsSinceEpoch = Math.floor(Date.now()/1000)
    return secondsSinceEpoch
}


// const getRoundExpirationTime = () => {
//     let currentTime = new Date();
//     currentTime.toUTCString()
//     return currentTime.setSeconds(currentTime.getSeconds() + 65);
// }

// const getRoundExpirationTime = () => {
//     const modalExpirationTime = getModalExpirationTime()
//     return modalExpirationTime + 60
// }

const generateWord = () => {
    return terms[Math.floor(Math.random()*terms.length)]
}


io.on('connection', socket => {
    console.log("A NEW USER HAS JOINED")

    socket.on('join', (room, callback) => {
        const { error, newUser } = addUser({
            id: socket.id,
            room: room
        })

        if(error)
            return callback(error)
        
        socket.join(newUser.room) //This just joins the socket **ON THE SERVER SIDE** (e.g. for sending messages, etc.)
        
        // console.log(getUsersInRoom('1234'))
        // console.log(users)
        // console.log(newUser)
        // console.log("The room this user is in is: ", newUser.room)
        // console.log(getUsersInRoom(newUser.room))
        
        socket.emit('setRole', newUser.role)
    })


    socket.on('readyRequest', () => {
        const user = getUser(socket.id)
        user.ready = true
        const partner = getPartner(socket.id)
        
        //If there is a second player already in the game and they are also set to "ready", we're good to start the game
        if(partner && partner.ready === true){
            const word = generateWord()
            const currentTime = getCurrentTime()
            const modalExpirationTime = currentTime + 6
            const roundExpirationTime = modalExpirationTime + 61
            io.to(user.room).emit('nextRoundResponse', 1, word, roundExpirationTime, modalExpirationTime) //let everyone in the room know the new word, and the new round # (for the new round)
        }
    })


    //When a drawing-user selects a new image
    socket.on('updateImageRequest', image => {
        const user = getUser(socket.id)
        io.to(user.room).emit('updateImageResponse', image)
    })


    //When a Guessing-User correctly guesses the round's word, update the 'numCorrectWords' variable to reflect
    socket.on('numCorrectWordsRequest', () => {
        
        // make variables for both players in the room
        const user = getUser(socket.id)
        const partner = getPartner(socket.id)
        

        // update 'numCorrectWords' attribute for each player (they're playing as a team, so we just tally any increments to both players)
        user.numCorrectWords+=1
        partner.numCorrectWords+=1
    })

    //When a Drawing-User selects to "pass" their turn --OR-- When a Guessing-User guesses the word correctly
    socket.on('nextRoundRequest', round => {
        const user = getUser(socket.id)
        const room = getRoom(socket.id)

        // if the game is over
        if(round === 10){
            const percentage = (user.numCorrectWords/10).toFixed(2)*100
            io.to(room).emit('endGameRequest', percentage) //let everyone in the room know the final percentage of correctly-guessed words
        } else{ //otherwise if the game is *NOT* over, and we just need to progress to the next round
            const word = terms[Math.floor(Math.random()*terms.length)] //generate a new word for the next round
            const currentTime = getCurrentTime()
            const modalExpirationTime = currentTime + 5
            const roundExpirationTime = modalExpirationTime + 60
            io.to(room).emit('nextRoundResponse', round+1, word, roundExpirationTime, modalExpirationTime) //let everyone in the room know the new word, and the new round # (for the new round)

            //FYI the sender can be either the "Drawing-User" (i.e. they selected to pass their turn), or (I will implement later) where a "Guessing-Player" can send a "nextRoundRequest" if they guess the word correctly
            const drawingPlayer = getDrawingUserInRoom(room)
            const guessingPlayer = getGuessingUserInRoom(room)
            drawingPlayer.role = 'Guessing-Player'
            guessingPlayer.role = 'Drawing-Player' //change the "role" of the socket in that socket's profile
            io.to(drawingPlayer.id).emit('setRole', 'Guessing-Player') //let ONLY the Drawing-Player in the room know that they are now a "Guessing-Player"
            io.to(guessingPlayer.id).emit('setRole', 'Drawing-Player') //let ONLY the next Drawing-Player in the room know that they are now the "Drawing-Player"
        }
    })

    //When a user disconnects
    socket.on('disconnect', message => {
        console.log("A USER HAS LEFT")
        const user = removeUser(socket.id)
        if(user)
            io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
    })


})
// --------------------------------------------------------------------------------------------




const path = require('path')
//serve static assets in production
app.use(express.static(path.resolve(__dirname, '../build')))
// app.get('*', (req, res) => {res.sendFile(path.resolve(__dirname, '../build', 'index.html'))})
app.get('/game', (req, res) => {res.sendFile(path.resolve(__dirname, '../build', 'index.html'))})







