const express = require('express');
const app = express();
const http  = require('http');
const { Server } = require('socket.io');
const cors = require('cors')
let terms = require('./terms'); //importing all the words to be used


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


const { addUser, removeUser, getUser, getUsersInRoom, getDrawingUserInRoom, getGuessingUserInRoom, getPartner, getRoom } = require('./users')


const getCurrentTime = () => {
    let secondsSinceEpoch = Math.floor(Date.now()/1000)
    return secondsSinceEpoch
}

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
        
        socket.join(newUser.room)
        socket.emit('setRole', newUser.role)
    })


    socket.on('nextRoundRequestReady', () => {
        const user = getUser(socket.id)
        user.ready = true
        const partner = getPartner(user.id, user.room)
        
        //Only start the game if there is a second player already in the game and they are also set to "ready"
        if(partner && partner.ready === true){
            const drawingPlayer = getDrawingUserInRoom(user.room)
            const guessingPlayer = getGuessingUserInRoom(user.room)

            const word = generateWord()
            const currentTime = getCurrentTime()
            const modalExpirationTime = currentTime + 6
            const roundExpirationTime = modalExpirationTime + 61
            const drawingModalMessage = 'The game is starting soon. You are first to draw!'
            const guessingModalMessage = 'The game is starting soon. Your partner is first to draw!'

            io.to(drawingPlayer.id).emit('nextRoundResponse', 1, word, roundExpirationTime, modalExpirationTime, drawingModalMessage)
            io.to(guessingPlayer.id).emit('nextRoundResponse', 1, word, roundExpirationTime, modalExpirationTime, guessingModalMessage)
        }
    })


    socket.on('nextRoundRequestCorrectGuess', round => {
        const user = getUser(socket.id)
        let drawingPlayer = getDrawingUserInRoom(user.room)
        let guessingPlayer = getGuessingUserInRoom(user.room)

        //Update number of correctly-guessed words
        drawingPlayer.numCorrectWords+=1 // update 'numCorrectWords' attribute for each player (they're playing as a team, so we just tally any increments to both players)
        guessingPlayer.numCorrectWords+=1

        if(round !== 10){
            // Update socket roles
            drawingPlayer.role = 'Guessing-Player'
            guessingPlayer.role = 'Drawing-Player'

            //Update drawingPlayer/guessingPlayer variables (as roles have switched)
            io.to(drawingPlayer.id).emit('setRole', 'Guessing-Player') 
            io.to(guessingPlayer.id).emit('setRole', 'Drawing-Player')
            drawingPlayer = getDrawingUserInRoom(user.room)
            guessingPlayer = getGuessingUserInRoom(user.room)

            const word = generateWord()
            const currentTime = getCurrentTime()
            const modalExpirationTime = currentTime + 6
            const roundExpirationTime = modalExpirationTime + 61
            const drawingModalMessage = 'You correctly guessed the word! You are next to draw!'
            const guessingModalMessage = 'Your partner correctly guessed the word! They are next to draw!'

            // io.to(user.room).emit('nextRoundResponse', 1, word, roundExpirationTime, modalExpirationTime, modalMessage) //let everyone in the room know the new word, and the new round # (for the new round)
            io.to(drawingPlayer.id).emit('nextRoundResponse', round+1, word, roundExpirationTime, modalExpirationTime, drawingModalMessage)
            io.to(guessingPlayer.id).emit('nextRoundResponse', round+1, word, roundExpirationTime, modalExpirationTime, guessingModalMessage)
        } else{
            const percentage = (user.numCorrectWords/10).toFixed(2)*100
            const drawingModalMessage = 'You correctly guessed the word!'
            const guessingModalMessage = 'Your partner correctly guessed the word!'
            drawingPlayer.ready = false
            guessingPlayer.ready = false
            io.to(drawingPlayer.id).emit('endGameRequest', percentage, drawingModalMessage)
            io.to(guessingPlayer.id).emit('endGameRequest', percentage, guessingModalMessage)
        }
    })

    socket.on('nextRoundRequestTimeExpired', round => {
        const user = getUser(socket.id)
        let drawingPlayer = getDrawingUserInRoom(user.room)
        let guessingPlayer = getGuessingUserInRoom(user.room)

        if(round !== 10){
            // Update socket roles
            drawingPlayer.role = 'Guessing-Player'
            guessingPlayer.role = 'Drawing-Player'

            //Update drawingPlayer/guessingPlayer variables (as roles have switched)
            io.to(drawingPlayer.id).emit('setRole', 'Guessing-Player')
            io.to(guessingPlayer.id).emit('setRole', 'Drawing-Player')
            drawingPlayer = getDrawingUserInRoom(user.room)
            guessingPlayer = getGuessingUserInRoom(user.room)

            const word = generateWord()
            const currentTime = getCurrentTime()
            const modalExpirationTime = currentTime + 6
            const roundExpirationTime = modalExpirationTime + 61
            const drawingModalMessage = 'Time ran out! You are next to draw!'
            const guessingModalMessage = 'Time ran out! Your partner is next to draw!'

            io.to(drawingPlayer.id).emit('nextRoundResponse', round+1, word, roundExpirationTime, modalExpirationTime, drawingModalMessage)
            io.to(guessingPlayer.id).emit('nextRoundResponse', round+1, word, roundExpirationTime, modalExpirationTime, guessingModalMessage)
        } else{
            const percentage = (user.numCorrectWords/10).toFixed(2)*100
            const modalMessage = 'Time ran out!'
            drawingPlayer.ready = false
            guessingPlayer.ready = false
            io.to(user.room).emit('endGameRequest', percentage, modalMessage)
        }
    })

    socket.on('nextRoundRequestPass', round => {
        const user = getUser(socket.id)
        let drawingPlayer = getDrawingUserInRoom(user.room)
        let guessingPlayer = getGuessingUserInRoom(user.room)

        if(round !== 10){
            // Update socket roles
            drawingPlayer.role = 'Guessing-Player'
            guessingPlayer.role = 'Drawing-Player' //change the "role" of the socket in that socket's profile

            //Update drawingPlayer/guessingPlayer variables (as roles have switched)
            io.to(drawingPlayer.id).emit('setRole', 'Guessing-Player')
            io.to(guessingPlayer.id).emit('setRole', 'Drawing-Player')
            drawingPlayer = getDrawingUserInRoom(user.room)
            guessingPlayer = getGuessingUserInRoom(user.room)

            const word = generateWord()
            const currentTime = getCurrentTime()
            const modalExpirationTime = currentTime + 6
            const roundExpirationTime = modalExpirationTime + 61
            const drawingModalMessage = 'Your partner passed their turn. You are next to draw!'
            const guessingModalMessage = 'You passed your turn. Your partner is next to draw!'
            
            io.to(drawingPlayer.id).emit('nextRoundResponse', round+1, word, roundExpirationTime, modalExpirationTime, drawingModalMessage)
            io.to(guessingPlayer.id).emit('nextRoundResponse', round+1, word, roundExpirationTime, modalExpirationTime, guessingModalMessage)
        } else{
            const percentage = (user.numCorrectWords/10).toFixed(2)*100
            const drawingModalMessage = 'You passed!'
            const guessingModalMessage = 'Your partner passed!'
            drawingPlayer.ready = false
            guessingPlayer.ready = false
            io.to(drawingPlayer.id).emit('endGameRequest', percentage, drawingModalMessage)
            io.to(guessingPlayer.id).emit('endGameRequest', percentage, guessingModalMessage)
        }
    })


    //When a drawing-user selects a new image
    socket.on('updateImageRequest', image => {
        const user = getUser(socket.id)
        io.to(user.room).emit('updateImageResponse', image)
    })

    //When a user disconnects
    socket.on('disconnect', message => {
        console.log("A USER HAS LEFT")
        const user = getUser(socket.id)
        const partner = getPartner(user.id, user.room)
        const modalMessage = 'Your partner has left the game.'

        if(partner)
            io.to(partner.id).emit('partnerLeft', modalMessage)
        removeUser(socket.id)
    })


})
const path = require('path')
//serve static assets in production
app.use(express.static(path.resolve(__dirname, '../build')))
app.get('/game', (req, res) => {res.sendFile(path.resolve(__dirname, '../build', 'index.html'))})







