let terms = require('./terms'); //this is importing all the words I will use!

const express = require('express');
const app = express();
const http  = require('http');
const { Server } = require('socket.io');
const cors = require('cors')


//This is just a placeholder (using for get/post requests)
app.use(express.urlencoded({
    extended: true
}));


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



// const router = require('./router');  //this line just makes it possible for us to use the "router" function (&details) that we defined in the router.js file
// app.use(router);









// The trial code stuff I added
// --------------------------------------------------------------------------------------------
const { addUser, removeUser, getUser, getUsersInRoom, getDrawingUserInRoom, getNextDrawingUserInRoom, getOpenRoom } = require('./users')

io.on('connection', socket => {
    console.log("A NEW USER HAS JOINED")


    //The message it's getting is: socket.emit('join', room, name, privacy, difficulty, numberOfRounds)
    socket.on('join', (room, name, matchMakingRequested, difficulty, numRounds) => {
        const { error, newUser} = addUser({
            id: socket.id,
            name: name,
            room: room,
            matchMakingRequested: matchMakingRequested,
            difficulty: difficulty,
            numRounds: numRounds
        })
        
        socket.join(newUser.room)
        
        // console.log(getUsersInRoom('apple-unicorn-antarctica'))
        // console.log(users)
        // console.log(newUser)
        
        // console.log("The room this user is in is: ", newUser.room)
        // console.log(getUsersInRoom(newUser.room))
        // console.log("The amount of people in the open room is: ", getOpenRoom().length)
        // console.log("The first open room is: ", getOpenRoom()[0].room)
        // console.log({"first_available_room":getOpenRoom()[0].room})
        
        socket.emit('setRole', newUser.role) 
    })


    //When a user clicks "Start" button, update their status to "Ready"
    socket.on('start', () => {
        const user = getUser(socket.id)
        if(user){
            user.ready = 'Yes'    
        }
        // console.log("Got here")
        // console.log(user)

        if(getUsersInRoom(user.room).length === 2 && getUsersInRoom(user.room)[0].ready === 'Yes' && getUsersInRoom(user.room)[1].ready === 'Yes' ){
            const word = terms[Math.floor(Math.random()*terms.length)]
            io.to(user.room).emit('start-game', word)
        }
    })

    
    //When a drawing-user selects a new image
    socket.on('updateImageRequest', image => {
        const user = getUser(socket.id)
        io.to(user.room).emit('updateImageResponse', image)
    })



    //When a Drawing-User selects to "pass" their turn --OR-- When a Guessing-User guesses the word correctly
    socket.on('nextRoundRequest', round => {
        const user = getUser(socket.id)

        const word = terms[Math.floor(Math.random()*terms.length)] //generate a new word for the next round
        io.to(user.room).emit('nextRoundResponse', round+1, word) //let everyone in the room know the new word, and the new round # (for the new round)

        //FYI the sender can be either the "Drawing-User" (i.e. they selected to pass their turn), or (I will implement later) where a "Guessing-Player" can send a "nextRoundRequest" if they guess the word correctly
        const drawingPlayer = getDrawingUserInRoom(user.room)[0]
        const nextDrawingPlayer = getNextDrawingUserInRoom(user.room)
        
        io.to(drawingPlayer.id).emit('setRole', 'Guessing-Player') //let ONLY the Drawing-Player in the room know that they are now a "Guessing-Player"
        io.to(nextDrawingPlayer.id).emit('setRole', 'Drawing-Player') //let ONLY the next Drawing-Player in the room know that they are now the "Drawing-Player"

        drawingPlayer.role = 'Guessing-Player'
        nextDrawingPlayer.role = 'Drawing-Player' //change the "role" of the socket in that socket's profile

    })

    //When a drawing-user OR guessing-user submit a message and/or guess that DOESN'T match that round's word, we should just send the message back to all the player's in the room in order to add that message to all the player's messages array
    socket.on('addMessageRequest', message => {
        const user = getUser(socket.id)

        io.to(user.room).emit('addMessageResponse', message) //let everyone in the room know to add that message to their array of messages

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



// app.get('/info', (req, res) => {
//     console.log(req)
//     console.log(req.query)
// })

//THIS IS SOMETHING I'M TRYING!
app.get('/available_room', (req, res) => {
    if(getOpenRoom().length !== 0){
        res.send({"first_available_room":getOpenRoom()[0].room})
    }else{
        res.send({"first_available_room":null})
    }
})



































// const { addUser, removeUser, getUser, getUsersInRoom, getUserScoresInRoom, getNextPlayer } = require('./users.js') //this makes it possible for us to use all of the create user/delete user/find user, etc. functions that we defined in the users.js file!


// // const http  = require('http').createServer(app);
// // const http  = require('http');


// // const io = require('socket.io')(http);


// // const cors = require('cors')
// // app.use(cors());


// // const server = http.createServer(app);


// // var cors = require("cors");
// // const corsOptions = {
// //   origin: "*",
// //   optionsSuccessStatus: 200
// // };

// // const io = new Server(server);
// // io.engine.on("initial_headers", (headers, req) => {
// //     headers["Access-Control-Allow-Origin"] = "http://localhost:3000";
// //   });
  
// //   io.engine.on("headers", (headers, req) => {
// //     headers["Access-Control-Allow-Origin"] = "http://localhost:3000"; // url to all
// //   });


// // app.use(cors(corsOptions));





// // const PORT = process.env.PORT || 8000;
// // server.listen(PORT, () => console.log(`Server running on port ${PORT}`))





// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`))


  
// //   httpServer.listen(3000);












// // const express = require('express');
// // const socketio = require('socket.io');
// // const http = require('http');

// // // we can run the server on 5000 (I chose 8080 though), but later for deployment we'll run it on a specific port which will be inside the process.env.PORT file(?)
// // const PORT = process.env.PORT || 8080

// // const router = require('./router');

// // const app = express();
// // const server = http.createServer(app);
// // const io = socketio(server); // an instance of the socket.io

// // app.use(router);

// // server.listen(PORT, () => console.log(`Server has stated on port ${PORT}`))



// // he said from the documentation that io.on() and socketio.on()
// // will be methods to enable us to register when a user is joining/leaving
// // when the "connection" event happens (we defined that event name on the client side?), we will console.log this message
// io.on('connection', (socket) => {
//     console.log('We have a new connection!!!!!')

//     socket.on('join', ({ name, room }, callback) => { //when a "join" event happens on the client side (which we defined on that client side, it sends the user "name" and "room" over to us, and we'll perform this function we've defined "callback" on those "name" and "room" terms)
//         // const { error : newUser } = addUser( { id: socket.id, name, room } ); //so this is us actually calling this "callback" functoin and we're telling it that we're going to pass EITHER the "err" object or the "user" object to the function "addUser"--why just either of those two variables? BECAUSE THOSE ARE THE ONLY TWO VARIABLES THAT WE'VE DEFINED THE "addUser" function to handle!! (go look at the details of that function for reference!!)
//         //if the above line results in an err, it will cause that return to happen (see the details of that function), therefore the only things that make it to the next line are when we're attempting to a add a VALID user! (cool!)
        
//         try{
//             newUser = addUser( { id: socket.id, name, room } );
//         }
        
//         catch(err) {
//             // console.log("Sorry Charlie!")
//             // I need to do something here because I can get to this point where the game recognizes a duplicate user, but I can't actually notify the user that there's a problem and they need to try another username!!!
//             // socket.emit('usernameTaken');  //But I think the problem is that they never actually get CONNECTED, so I can't actually send them anything?
//           }
        
//         // console.log(name)
//         // console.log(room)
//         // console.log(socket.id)
//         // console.log(newUser) //but maybe I need a UseEffect hook for this too because it's not updating when new users get added to it?
        
//         console.log(getUsersInRoom('2'))

//         socket.join(newUser.room)

//     });


//     // if this is the first player to join that room, notify the socket that they will be the drawing-player (otherwise send a gameData request to another socket, and then use the response to update this newly-joining socket's gamedata)
//     socket.on('initialGameStateRequest', () => {
//         const user = getUser(socket.id)
//         const room = user.room

//         // user = JSON.stringify(user)
//         // user = JSON.parse(user)
//         // room = room.toString() //I am going to change "room" into a string so that it works again?

//         //if the this is the first user entering the game, transmit initial game state
//         if(getUsersInRoom(room).length === 1) {
//             socket.emit('initialGameStateResponse', getUser(socket.id).role, getUsersInRoom(room), getUserScoresInRoom(room), [], 1, 'testword', [], 'testURL')
//         }
        
//         //this is my else statement
//         else{
//             socket.to(room).emit('activeGameStateRequest', 'message')
//         }


//     })
    




//     socket.on('disconnect', () => {
//         console.log('User has left!!!');

//         //disconnect the user
//         const user = removeUser(socket.id)

//         //update the roomData state
//         if(user){
//             io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
//         }
//     })




// })










