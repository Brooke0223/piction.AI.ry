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


    socket.on('nextRoundRequestReady', () => {
        const user = getUser(socket.id)
        user.ready = true
        const partner = getPartner(socket.id)
        
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

            // io.to(user.room).emit('nextRoundResponse', 1, word, roundExpirationTime, modalExpirationTime, modalMessage) //let everyone in the room know the new word, and the new round # (for the new round)
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
            guessingPlayer.role = 'Drawing-Player' //change the "role" of the socket in that socket's profile

            //Update drawingPlayer/guessingPlayer variables (as roles have switched)
            //I SHOULD TRY TO CHANGE THE "setRole" THING SO THAT IT'S JUST ALL DONE WITH THE NEXT ROUND RESPONSE THING?
            io.to(drawingPlayer.id).emit('setRole', 'Guessing-Player') //let ONLY the Drawing-Player in the room know that they are now a "Guessing-Player"
            io.to(guessingPlayer.id).emit('setRole', 'Drawing-Player') //let ONLY the next Drawing-Player in the room know that they are now the "Drawing-Player"
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
            guessingPlayer.role = 'Drawing-Player' //change the "role" of the socket in that socket's profile

            //Update drawingPlayer/guessingPlayer variables (as roles have switched)
            //I SHOULD TRY TO CHANGE THE "setRole" THING SO THAT IT'S JUST ALL DONE WITH THE NEXT ROUND RESPONSE THING?
            io.to(drawingPlayer.id).emit('setRole', 'Guessing-Player') //let ONLY the Drawing-Player in the room know that they are now a "Guessing-Player"
            io.to(guessingPlayer.id).emit('setRole', 'Drawing-Player') //let ONLY the next Drawing-Player in the room know that they are now the "Drawing-Player"
            drawingPlayer = getDrawingUserInRoom(user.room)
            guessingPlayer = getGuessingUserInRoom(user.room)

            const word = generateWord()
            const currentTime = getCurrentTime()
            const modalExpirationTime = currentTime + 6
            const roundExpirationTime = modalExpirationTime + 61
            const drawingModalMessage = 'Time ran out! You are next to draw!'
            const guessingModalMessage = 'Time ran out! Your partner is next to draw!'

            // io.to(user.room).emit('nextRoundResponse', 1, word, roundExpirationTime, modalExpirationTime, modalMessage) //let everyone in the room know the new word, and the new round # (for the new round)
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
            //I SHOULD TRY TO CHANGE THE "setRole" THING SO THAT IT'S JUST ALL DONE WITH THE NEXT ROUND RESPONSE THING?
            io.to(drawingPlayer.id).emit('setRole', 'Guessing-Player') //let ONLY the Drawing-Player in the room know that they are now a "Guessing-Player"
            io.to(guessingPlayer.id).emit('setRole', 'Drawing-Player') //let ONLY the next Drawing-Player in the room know that they are now the "Drawing-Player"
            drawingPlayer = getDrawingUserInRoom(user.room)
            guessingPlayer = getGuessingUserInRoom(user.room)

            const word = generateWord()
            const currentTime = getCurrentTime()
            const modalExpirationTime = currentTime + 6
            const roundExpirationTime = modalExpirationTime + 61
            const drawingModalMessage = 'Your partner passed their turn! You are next to draw!'
            const guessingModalMessage = 'You passed your turn! Your partner is next to draw!'
            
            // io.to(user.room).emit('nextRoundResponse', 1, word, roundExpirationTime, modalExpirationTime, modalMessage) //let everyone in the room know the new word, and the new round # (for the new round)
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







