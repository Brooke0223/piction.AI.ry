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