const users = []


const addUser = ({id, room}) => {
    const numberOfUsersInRoom = users.filter(user => user.room === room).length
    let role
    
    if(numberOfUsersInRoom === 2){
        return { error: 'Room full' }
    }

    //I think I can do away with most of this though and simplify it, because I'm making it where if a player leaves, the game will reset--THUS if you're the first player in a room you are the 'Drawing-Player', and if you're the second player, you are the 'Guessing-Player', PERIOD.
    else if(numberOfUsersInRoom === 1){
        const { role: roleOfPartner } = getPartner(id, room)
        role = (roleOfPartner === 'Drawing-Player') ? 'Guessing-Player' : 'Drawing-Player'
    }else{
        role = 'Drawing-Player'
    }
    
    const newUser = { id, room, role, ready: false, numCorrectWords: 0 }
    users.push(newUser)
    return { newUser }
}

const removeUser = id => {
    const removeIndex = users.findIndex(user => user.id === id)

    if(removeIndex!==-1)
        return users.splice(removeIndex, 1)[0]
}

const getUser = id => {
    return users.find(user => user.id === id)
}

const getRoom = id => {
    const user = users.find(user => user.id === id)
    return user.room
}

//This returns the *OTHER* user in the room (i.e. if there's one who *doesn't* match the user.id we plugged in)
//MAYBE I COULD RENAME THIS--"getPartner"?
// const getPartner = id => {
//     return users.find(user => user.id !== id)
// }

const getPartner = (id, room) => {
    const playersInRoom = users.filter(user => user.room === room)
    return playersInRoom.find(user => user.id !== id)
}

const getUsersInRoom = room => {
    return users.filter(user => user.room === room)
}


const getDrawingUserInRoom = room => {
    const users = getUsersInRoom(room)
    return users.filter(user => user.role === 'Drawing-Player')[0]
}

const getGuessingUserInRoom = room => {
    const users = getUsersInRoom(room)
    return users.filter(user => user.role === 'Guessing-Player')[0]
}


module.exports = { addUser, removeUser, getUser, getUsersInRoom, getDrawingUserInRoom, getGuessingUserInRoom, getPartner, getRoom }




















































// const users = []


// //returns all users (i.e. the user *objects*) in given (parameter) room
// function getUsersInRoom(room){
//     // return users.filter(user => user.room === room)
//     return users.filter(user => user.room === room)
// }


// //adds user with given (parameter) id, name, and room to list of active users (i.e "users")
// function addUser( id, name, room ){

//     const existingUser = users.find((user) => user.name === name) //now let's check and see if a user by that name already exists in our list of currently active users

//     if(existingUser) { //if the username already exists, return an error
//         throw "User name is taken"
//         // return {error: "User name is taken"}
//     }

//     const newUser = { id:id, name:name, room:room } //otherwise (if the username doesn't already exist), add them to the array of active users
//     users.push(newUser);

//     //Make the other variables a "user" object has to hold
//     newUser.player_number = parseInt(getUsersInRoom(room).length) //NOTE: I don't need to +1 to the length here to get the player's number, because I've already placed them into that room!
//     newUser.score = 0
//     if(getUsersInRoom(room).length == 1){
//         newUser.role = "Drawing-Player"
//     }
//     else{
//         newUser.role = "Guessing-Player"
//     }
    
//     return newUser;
// }



// //removes user with given (parameter) id from users list
// function removeUser(id) {
//     const index = users.findIndex((user) => user.id === id);

//     if(index !== -1) {
//         users.splice(index, 1)[0];
//     }
//   }

// // const removeUser = (id) => {
// //     const index = users.findIndex((user) => user.id === id);

// //     if(index !== -1) {
// //         return users.splice(index, 1)[0];
// //     }
// // }


// //returns user with given (parameter) id
// // const getUser = (id) => {
// //     return users.find((user) => user.id === id)
// // }
// function getUser(id) {
//     return users.find((user)=> user.id === id)
// }




// //returns (descending) list of user's names + their scores, e.g. ({name: score}, {name:score}), etc.
// function getUserScoresInRoom(room) {
//     const players = users.filter(user => user.room === room)
//     const scores = players.map(person => ({ name: person.name, score: person.score })); //make an array of object ({name: score}, {name:score})

//     scores.sort((a, b) => a.name < b.name ? 1 : -1); //this just sorts the array from largest to smallest scores
//     return scores
// }






// //returns next player in the room (perhaps, who will be drawing next)
// //takes the room in question, and the "ID" IS ID OF THE CURRENT PLAYER!!!!
// function getNextPlayer(room, id) {
//     const users = getUsersInRoom(room)

//     const index = users.findIndex((currentPlayer) => currentPlayer.id === id);

//     let nextIndex
//     if(index+1 === users.length){
//         nextIndex = 0
//     }
//     else{
//         nextIndex = index+1
//     }

//     //return the user object of the next user (i.e. the user AFTER whatever the current user we plugged in was)
//     return users[nextIndex]
// }

// module.exports = {users, getUsersInRoom, addUser, removeUser, getUser, getUserScoresInRoom, getNextPlayer}