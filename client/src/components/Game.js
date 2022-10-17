//NOTE: useRef is only being used here to compensate for the useEffect Hook rendering twice on each mount (known React glitch when in production). https://stackoverflow.com/questions/72238175/useeffect-is-running-twice-on-mount-in-react
import React, { useState, useEffect, useRef } from "react"; //lets us have state variable
import queryString from 'query-string'; // lets us retrieve data that is present as a query in the URL
import io from 'socket.io-client';
import { terms } from "../terms"; //THIS IS THE LIST OF WORDS TO GUESS FROM!!!!!
import './Game.css'



const ENDPOINT = 'http://localhost:3001'
const socket = io(ENDPOINT); 




const data = queryString.parse(window.location.search)
const name = data.name
const room = data.room
const placeholderImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE3CETL_OertJKScoHfblxs6CBrKGVCmVESw&usqp=CAU"


const Game = (props) => {

  //User State
  const [ready, setReady] = useState(false)
  const [tutorial, setTutorial] = useState(false)
  const [round, setRound] = useState(0)
  const [role, setRole] = useState('')
  const [word, setWord] = useState('')
  const [searchTerms, setSearchTerms] = useState('')
  const [message, setMessage] = useState('')
  const [imageOptions, setImageOptions] = useState([])
  const [image, setImage] = useState(placeholderImage)
  const [selectedImages, setSelectedImages] = useState([placeholderImage])

  //When the user clicks "Start", update server that the player is ready to begin
  const onStartHandler = () => {
    setReady(true)
    socket.emit("start")
  }

  //When the user clicks "Learn More" on the initial screen, change so they can only see the tutorial info
  const onTutorialHandler = () => {
    if (window.confirm("Would you like to leave the game room to learn more about how the game is played?")) {
      setTutorial(true)
    }
  }

  //When a user currently in the "Tutorial" screen clicks the back button (to exit the tutorial)
  const onEndTutorialHandler = () => {
    setTutorial(false)
  }    

  //When the drawing-user clicks to "submit" their search terms
  const submitSearchTerms = (e) => {
    e.preventDefault();

    //if they haven't actually entered anything into the input box (i.e. "searchTerms" === '')
    //...just don't do anything (this is an invalid request that would bug-out our API request)
    if(searchTerms === ''){
      return
    }

    const formattedSearchTerms = searchTerms.split(' ').join('+');
    setSearchTerms('') //I should clear out the search terms so the input goes back to the placeholder?
    // console.log(formattedSearchTerms)

    // send request to the API
    const proxy_url = 'https://cors-anywhere.herokuapp.com/';
    fetch(proxy_url+ 'https://lexica.art/api/v1/search?q=' + formattedSearchTerms)
      .then(response => response.json())
      .then(data => {

    //save the first four images returned by the API
    const image1 = data.images[0].src
    const image2 = data.images[1].src
    const image3 = data.images[2].src
    const image4 = data.images[3].src

    let array = []
    setImageOptions(array)
    array.push(image1, image2, image3, image4)
    setImageOptions(array)
    // console.log(imageOptions)
  })
  }


  //When the drawing user clicks (selects) one of their 4 image options
  const clickChange = (e) => {
    if (window.confirm("Confirm to send this image")) {
      
      //clear the imageOptions array
      let array = []
      setImageOptions(array)

      //add the selected image to the list we keep of the user's selected images for this round (for undo/redo purposes)
      array = [...selectedImages, e];
      setSelectedImages(array);
      // console.log(selectedImages)

      //notify the server that it needs to update the display image for the entire room (i.e. it needs to return something that will 'setImage')
      socket.emit('updateImageRequest', e)
    }
  }




  //When a Drawing-User clicks the "Undo" button (wants to revert to a previously-sent image)
  const onUndoImageHandler = () => {
    //if the Drawing-User is currently reviewing their image options (i.e. "imageOptions" !==0)
    //...just clear out the "imageOptions" array, and that will make their view go back to viewing the "image" (don't need to change the "Guessing-Player"'s view since they couldn't see their preview images anyways)
    if(imageOptions.length !== 0){
      const arr = []
      setImageOptions(arr)
      return //this makes it so the rest of the block of code will not be executed if this part was true (so the rest of the block of code is basically just our "else" statement)
    }
    
    //otherwise is the Drawing-User is NOT currently reviewing their image options (i.e. "imageOptions" === 0)
    //...check what index the current "image" is set to in the "selectedImages" array
    const index = selectedImages.indexOf(image)

    //if it's at index 0, just return (since it is an invalid "undo" request)
    //otherwise, set the "image" to be whatever image is at the previous index in the "selectedImages" array
    if(index === 0){
      return //just return and don't do antything since this is an invalid "undo" request
    } else{
      const previousImage = selectedImages[index-1]
      socket.emit('updateImageRequest', previousImage) //let the server know that we need to update the image
    }
  }



  //When a Drawing-User clicks the "Redo" button (wants to revert to a subsequently-sent image)
  const onRedoImageHandler = () => {
    //if the Drawing-User is currently reviewing their image options (i.e. "imageOptions" !==0)
    //...I don't feel like "redo" should be a valid option in that case
    if(imageOptions.length !== 0){
      alert('Invalid Redo Request')
      return //this makes it so the rest of the block of code will not be executed if this part was true (so the rest of the block of code is basically just our "else" statement)
    }

    //otherwise is the Drawing-User is NOT currently reviewing their image options (i.e. "imageOptions" === 0)
    //...check what index the current "image" is set to in the "selectedImages" array
    const index = selectedImages.indexOf(image)

    //if they're currently at the final index (i.e. "index" === selectedImages.length), just return and don't do anything (since it is an invalid "redo" request)
    //otherwise, set the "image" to be whatever image is at the *next* index in the "selectedImages" array
    if(index === selectedImages.length-1){
      return
    } else{
      const subsequentImage = selectedImages[index+1]
      socket.emit('updateImageRequest', subsequentImage) //let the server know that we need to update the image
    }
  }
  
  //When a Drawing-User clicks "Pass" button (to pass their turn)
  const onPassHandler = () => {
    if (window.confirm("Are you sure you want to pass your turn?")) {
      //let the server know that we need to update game variables ("roles", the "round" number, the "word" for that round, reset "image"/"imageOptions"/"searchTerms"/"selectedImages")
      socket.emit('nextRoundRequest', round)
    }
  }
  
  //When the Guessing-User submits a guess (i.e. a message)
  const submitMessage = (e) => {
    e.preventDefault();
    console.log(message)
    //check if the message and that round's word match (everything lowercase)
    //If they match I feel like I should do some kind of special thing?
    //if the message matches that round's word, let the server know to update to the next round
    //if the message and that round's word do NOT match, let the server know to send that message back to all the players in the room so that it can be added to averyone's array of messages (I will use the array to map out the messages in a chat box)
    //the server will look at the name of who is submitting the message (it can get their name from the socket.id)
    setMessage('') //I should clear out the message so the input box goes back to showing the
  }





  const isInitialMount = useRef(true); //I am only including this "useRef" thing here to prevent the useHook from mounting twice (while I'm in development), this is a know React issue (https://stackoverflow.com/questions/72238175/useeffect-is-running-twice-on-mount-in-react)
  useEffect(() => {
  
  if (isInitialMount.current) {  
          isInitialMount.current = false; //...and change the value to "false" for next time :)
       } else {
    
    //When a new socket joins, let the server know the socket's name and room number so the server can add that socket to that socket-room
    socket.emit('join', room, name)
    
    //Upon joining, the socket returns back what that user's initial role will be
    socket.on('setRole', role => {
      setRole(role)
      console.log(role)
    })

    //Game begins when server let's sockets know that both users have clicked "start"
    socket.on('start-game', (word) => {
      setRound(1)
      setWord(word)
      // console.log("I set the round to 1")
      // console.log("word")
    })

    //When a drawing-user selects a new display image, the server informs all sockets to update their image
    socket.on('updateImageResponse', (image) => {
      setImage(image)
    })

    //When a drawing-user passes their turn or a guessing-user guesses the word correctly, the server informs all sockets to update their round #, their word, and reset any new round variables (like "image", "imageOptions", "searTerms", and "selectedImages")
    socket.on('nextRoundResponse', (round, word) => {
      setRound(round)
      setWord(word)
      setImage(placeholderImage)
      setSearchTerms('')
      setImageOptions([])
      setSelectedImages([placeholderImage])
      
    })
    
  }}, [socket])





  
  return (
    <div>
      
      
      {/* BOTH PLAYERS SEE THE INITIAL START-UP SCREEN */}
      {(tutorial !== true) && <h1>Room {room}</h1>}
      {(!ready && tutorial === false) && <button onClick={onStartHandler}>Play Game</button>}
      {(!ready && tutorial === false) && <button onClick={onTutorialHandler}>Learn More</button>}
      {(!ready && tutorial === true) && 
          <>
            <h1>Piction.AI.ry</h1>
            <p>More information about Piction.AI.ry Here</p>
            <button onClick={onEndTutorialHandler}>Back</button>
          </>
      }

      {(ready && round === 0) && <h1>Waiting for other player to Click Start</h1>}
      
      
      {/* BOTH PLAYERS SEE THEIR ROLE IN THE GAME AND THE DISPLAY IMAGE*/}
      {(ready && round !== 0 && imageOptions.length === 0)  && 
        <>
            <h1>You are the {role}!</h1>
            <img id="image" width="500" height="300" src={image}/>
        </>
      }

      {/* DRAWING-PLAYER VIEW */}
      {(role === 'Drawing-Player' && imageOptions !== []) && 
        <div id="imageWrapper">{imageOptions.map((image, index) => {
        return (
          <div key={index}>
            <img id="imageOptions" width="150" height="150" onClick={() => clickChange(image)} src={image}/>
          </div>
        );
        })}
        </div>}


        {(role === 'Drawing-Player' && round !== 0) && <>
        <h1 title="This is the word you're trying to get the other players to guess">Your word is: {word}</h1>
          <form onSubmit={submitSearchTerms}>
            <input type="text" value={searchTerms} onChange={event => setSearchTerms(event.target.value)} placeholder='Enter your search terms here'/>
            <input type="submit"/>
          </form>
          <br></br>
          <button title="Don't like your image? Unsend this image" onClick={onUndoImageHandler}>Undo</button>
          <button title="Don't like your image? Resend previous image" onClick={onRedoImageHandler}>Redo</button>
          <button title="Pass Your Turn" onClick={onPassHandler}>PASS</button>
          </>}




        {/* GUESSING-PLAYER VIEW */}
        {(role === 'Guessing-Player' && round !== 0) && <>
        <form onSubmit={submitMessage}>
          <br></br>
          <input type="text" value={message} onChange={event => setMessage(event.target.value)} placeholder='Enter your guesses here'/>
          <input type="submit"/>
        </form>
        </>}
      
      


      {/* {role === 'Drawing-Player'
      ? <h1>You are a drawing player</h1>
      : <h1>You are a guessing player</h1>
      } */}
      
    </div>
  )
}

export default Game

































// const Game = (props) => {
//   const data = queryString.parse(props.location.search)

//   //initialize socket state
//     // const [role, setRole] = useState('')
//     // const [messages, setMessages] = useState([])
//     // const [players, setPlayers] = useState([])
//     // const [leaderboard, setLeaderboard] = useState([])
//     // const [messages, setMessages] = useState([])
//     // const [round, setRound] = useState(0)
//     // const [word, setWord] = useState('')
//     // const [images, setImages] = useState([])
//     // const [currentImage, setCurrentImage] = useState('')
//     // const [room, setRoom] = useState('')
//     // const [images, setImages] = useState([])

//   useEffect(() => {
//       const connectionOptions =  {
//           "forceNew" : true,
//           "reconnectionAttempts": "Infinity", 
//           "timeout" : 10000,                  
//           "transports" : ["websocket"]
//       }
//       socket = io.connect(ENDPOINT, connectionOptions)

//       const data = queryString.parse(window.location.search)
//       const name = data.name
//       const room = data.room
      
//       socket.emit('join', {room: room}, (error) => {
//           if(error)
//               setRoomFull(true)
//       })

//       //cleanup on component unmount
//       return function cleanup() {
//           socket.emit('disconnect')
//           //shut down connnection instance
//           socket.off()
//       }
//   }, [])

//   //initialize game state
//   const [gameOver, setGameOver] = useState(true)
//   const [winner, setWinner] = useState('')
//   const [turn, setTurn] = useState('')
//   // const [players, setPlayers] = useState([])
//   // const [leaderboard, setLeaderboard] = useState([])
//   // const [round, setRound] = useState(0)
//   // const [word, setWord] = useState('')
//   // const [currentImage, setCurrentImage] = useState('')



//   //runs once on component mount
//   useEffect(() => {
//       //do all my initial things here to start the game (like maybe make the first player the drawing player?)
//       const shuffledCards = shuffleArray(PACK_OF_CARDS)

//       //send initial state to server
//       socket.emit('initGameState', {
//           gameOver: false,
//           turn: 'Player 1',

//       })
//   }, [])

//   useEffect(() => {
//       socket.on('initGameState', ({ gameOver, turn, player1Deck, player2Deck, currentColor, currentNumber, playedCardsPile, drawCardPile }) => {
//           setGameOver(gameOver)
//           setTurn(turn)
//           setPlayer1Deck(player1Deck)
//           setPlayer2Deck(player2Deck)
//           setCurrentColor(currentColor)
//           setCurrentNumber(currentNumber)
//           setPlayedCardsPile(playedCardsPile)
//           setDrawCardPile(drawCardPile)
//       })

//       socket.on('updateGameState', ({ gameOver, winner, turn, player1Deck, player2Deck, currentColor, currentNumber, playedCardsPile, drawCardPile }) => {
//           gameOver && setGameOver(gameOver)
//           gameOver===true && playGameOverSound()
//           winner && setWinner(winner)
//           turn && setTurn(turn)
//           player1Deck && setPlayer1Deck(player1Deck)
//           player2Deck && setPlayer2Deck(player2Deck)
//           currentColor && setCurrentColor(currentColor)
//           currentNumber && setCurrentNumber(currentNumber)
//           playedCardsPile && setPlayedCardsPile(playedCardsPile)
//           drawCardPile && setDrawCardPile(drawCardPile)
//           setUnoButtonPressed(false)
//       })

//       socket.on("roomData", ({ users }) => {
//           setUsers(users)
//       })

//       socket.on('currentUserData', ({ name }) => {
//           setCurrentUser(name)
//       })

//       socket.on('message', message => {
//           setMessages(messages => [ ...messages, message ])

//           const chatBody = document.querySelector('.chat-body')
//           chatBody.scrollTop = chatBody.scrollHeight
//       })
//   }, [])


//   //some util functions
//   const checkGameOver = (arr) => {
//       return arr.length === 1
//   }
  
//   const checkWinner = (arr, player) => {
//       return arr.length === 1 ? player : ''
//   }


//   const sendMessage= (event) => {
//       event.preventDefault()
//       if(message) {
//           socket.emit('sendMessage', { message: message }, () => {
//               setMessage('')
//           })
//       }
//   }



//   //driver functions
//   const onCardPlayedHandler = (played_card) => {
//       //extract player who played the card
//       const cardPlayedBy = turn
//       switch(played_card) {
//           //if card played was a number card
//           case '0R': case '1R': case '2R': case '3R': case '4R': case '5R': case '6R': case '7R': case '8R': case '9R': case '_R': case '0G': case '1G': case '2G': case '3G': case '4G': case '5G': case '6G': case '7G': case '8G': case '9G': case '_G': case '0B': case '1B': case '2B': case '3B': case '4B': case '5B': case '6B': case '7B': case '8B': case '9B': case '_B': case '0Y': case '1Y': case '2Y': case '3Y': case '4Y': case '5Y': case '6Y': case '7Y': case '8Y': case '9Y': case '_Y': {
//               //extract number and color of played card
//               const numberOfPlayedCard = played_card.charAt(0)
//               const colorOfPlayedCard = played_card.charAt(1)
//               //check for color match
//               if(currentColor === colorOfPlayedCard) {
//                   console.log('colors matched!')
//                   //check who played the card and return new state accordingly
//                   if(cardPlayedBy === 'Player 1') {
//                       //remove the played card from player1's deck and add it to playedCardsPile (immutably)
//                       //then update turn, currentColor and currentNumber
//                       const removeIndex = player1Deck.indexOf(played_card)
//                       //if two cards remaining check if player pressed UNO button
//                       //if not pressed add 2 cards as penalty
//                       if(player1Deck.length===2 && !isUnoButtonPressed) {
//                           alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
//                           //make a copy of drawCardPile array
//                           const copiedDrawCardPileArray = [...drawCardPile]
//                           //pull out last two elements from it
//                           const drawCard1 = copiedDrawCardPileArray.pop()
//                           const drawCard2 = copiedDrawCardPileArray.pop()
//                           const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
//                           updatedPlayer1Deck.push(drawCard1)
//                           updatedPlayer1Deck.push(drawCard2)
//                           !isSoundMuted && playShufflingSound()
//                           //send new state to server
//                           socket.emit('updateGameState', {
//                               gameOver: checkGameOver(player1Deck),
//                               winner: checkWinner(player1Deck, 'Player 1'),
//                               turn: 'Player 2',
//                               playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
//                               player1Deck: [...updatedPlayer1Deck],
//                               currentColor: colorOfPlayedCard,
//                               currentNumber: numberOfPlayedCard,
//                               drawCardPile: [...copiedDrawCardPileArray]
//                           })
//                       }
//                       else {
//                           !isSoundMuted && playShufflingSound()
//                           //send new state to server
//                           socket.emit('updateGameState', {
//                               gameOver: checkGameOver(player1Deck),
//                               winner: checkWinner(player1Deck, 'Player 1'),
//                               turn: 'Player 2',
//                               playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
//                               player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
//                               currentColor: colorOfPlayedCard,
//                               currentNumber: numberOfPlayedCard
//                           })
//                       }
//                   }
//               }
//               //if no color or number match, invalid move - do not update state
//               else {
//                   alert('Invalid Move!')
//               }
//               break;
//           }
//       }
//   }
  


//   const onCardDrawnHandler = () => {
//       //extract player who drew the card
//       const cardDrawnBy = turn
//       //check who drew the card and return new state accordingly
//       if(cardDrawnBy === 'Player 1') {
//           //remove 1 new card from drawCardPile and add it to player1's deck (immutably)
//           //make a copy of drawCardPile array
//           const copiedDrawCardPileArray = [...drawCardPile]
//           //pull out last element from it
//           const drawCard = copiedDrawCardPileArray.pop()
//           //extract number and color of drawn card
//           const colorOfDrawnCard = drawCard.charAt(drawCard.length - 1)
//           let numberOfDrawnCard = drawCard.charAt(0)
//           if(colorOfDrawnCard === currentColor && (drawCard === 'skipR' || drawCard === 'skipG' || drawCard === 'skipB' || drawCard === 'skipY')) {
//               alert(`You drew ${drawCard}. It was played for you.`)
//               !isSoundMuted && playShufflingSound()
//               //send new state to server
//               socket.emit('updateGameState', {
//                   playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
//                   currentColor: colorOfDrawnCard,
//                   currentNumber: 404,
//                   drawCardPile: [...copiedDrawCardPileArray]
//               })
//           }
//           else if(colorOfDrawnCard === currentColor && (drawCard === 'D2R' || drawCard === 'D2G' || drawCard === 'D2B' || drawCard === 'D2Y')) {
//               alert(`You drew ${drawCard}. It was played for you.`)
//               //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
//               //make a copy of drawCardPile array
//               const copiedDrawCardPileArray = [...drawCardPile]
//               //pull out last two elements from it
//               const drawCard1 = copiedDrawCardPileArray.pop()
//               const drawCard2 = copiedDrawCardPileArray.pop()
//               !isSoundMuted && playDraw2CardSound()
//               //send new state to server
//               socket.emit('updateGameState', {
//                   playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
//                   player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
//                   currentColor: colorOfDrawnCard,
//                   currentNumber: 252,
//                   drawCardPile: [...copiedDrawCardPileArray]
//               })
//           }
//           else if(drawCard === 'W') {
//               alert(`You drew ${drawCard}. It was played for you.`)
//               //ask for new color
//               const newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
//               !isSoundMuted && playWildCardSound()
//               //send new state to server
//               socket.emit('updateGameState', {
//                   turn: 'Player 2',
//                   playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
//                   currentColor: newColor,
//                   currentNumber: 300,
//                   drawCardPile: [...copiedDrawCardPileArray]
//               })
//           }
//           //else add the drawn card to player1's deck
//           else {
//               !isSoundMuted && playShufflingSound()
//               //send new state to server
//               socket.emit('updateGameState', {
//                   turn: 'Player 2',
//                   player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard, ...player1Deck.slice(player1Deck.length)],
//                   drawCardPile: [...copiedDrawCardPileArray]
//               })
//           }
//       }
//   }
  












//   return (
//       <div>
          
//           {/* //if the room is NOT full display this: */}
//           {(!roomFull) ? <>

//               <div>
//                   <h1>Game Code: {room}</h1>
//                       <button className='game-button green'>
//                       </button>
//               </div>

//               {/* PLAYER LEFT MESSAGES */}
//               {users.length===1 && currentUser === 'Player 2' && <h1>Player 1 has left the game.</h1> }
//               {users.length===1 && currentUser === 'Player 1' && <h1>Waiting for Player 2 to join the game.</h1> }
              


//               {users.length===2 && <>

//                   {gameOver ? <div>{winner !== '' && <><h1>GAME OVER</h1><h2>{winner} wins!</h2></>}</div> :
//                   <div>
//                       {/* PLAYER 1 VIEW */}
//                       {currentUser === 'Player 1' && <>    
//                       <div className='player2Deck' style={{pointerEvents: 'none'}}>
//                           <p className='playerDeckText'>Player 2</p>
//                           {turn==='Player 2' && <Spinner />}
//                       </div>
//                       <br />
//                       <div className='middleInfo' style={turn === 'Player 2' ? {pointerEvents: 'none'} : null}>
//                           <button className='game-button' disabled={turn !== 'Player 1'} onClick={onCardDrawnHandler}>DRAW CARD</button>
//                           <button className='game-button orange' disabled={player1Deck.length !== 2} onClick={() => {
//                               setUnoButtonPressed(!isUnoButtonPressed)
//                               playUnoSound()
//                           }}>UNO</button>
//                       </div>
//                       <br />
//                       <div className='player1Deck' style={turn === 'Player 1' ? null : {pointerEvents: 'none'}}>
//                           <p className='playerDeckText'>Player 1</p>
//                       </div>

//                       <div className="chatBoxWrapper">
//                           <div className="chat-box chat-box-player1">
//                               <div className="chat-head">
//                                   <h2>Chat Box</h2>
//                                   {!isChatBoxHidden ?
//                                   <span onClick={toggleChatBox} class="material-icons">keyboard_arrow_down</span> :
//                                   <span onClick={toggleChatBox} class="material-icons">keyboard_arrow_up</span>}
//                               </div>
//                               <div className="chat-body">
//                                   <div className="msg-insert">
//                                       {messages.map(msg => {
//                                           if(msg.user === 'Player 2')
//                                               return <div className="msg-receive">{msg.text}</div>
//                                           if(msg.user === 'Player 1')
//                                               return <div className="msg-send">{msg.text}</div>
//                                       })}
//                                   </div>
//                                   <div className="chat-text">
//                                       <input type='text' placeholder='Type a message...' value={message} onChange={event => setMessage(event.target.value)} onKeyPress={event => event.key==='Enter' && sendMessage(event)} />
//                                   </div>
//                               </div>
//                           </div>
//                       </div> </> }

//                       {/* PLAYER 2 VIEW */}
//                       {currentUser === 'Player 2' && <>
//                       <div className='player1Deck' style={{pointerEvents: 'none'}}>
//                           <p className='playerDeckText'>Player 1</p>
//                           {turn==='Player 1' && <Spinner />}
//                       </div>
//                       <br />
//                       <div className='middleInfo' style={turn === 'Player 1' ? {pointerEvents: 'none'} : null}>
//                           <button className='game-button' disabled={turn !== 'Player 2'} onClick={onCardDrawnHandler}>DRAW CARD</button>
//                       </div>
//                       <br />
//                       <div className='player2Deck' style={turn === 'Player 1' ? {pointerEvents: 'none'} : null}>
//                           <p className='playerDeckText'>Player 2</p>
//                       </div>

//                       <div className="chatBoxWrapper">
//                           <div className="chat-box chat-box-player2">
//                               <div className="chat-head">
//                                   <h2>Chat Box</h2>
//                                   {!isChatBoxHidden ?
//                                   <span onClick={toggleChatBox} class="material-icons">keyboard_arrow_down</span> :
//                                   <span onClick={toggleChatBox} class="material-icons">keyboard_arrow_up</span>}
//                               </div>
//                               <div className="chat-body">
//                                   <div className="msg-insert">
//                                       {messages.map(msg => {
//                                           if(msg.user === 'Player 1')
//                                               return <div className="msg-receive">{msg.text}</div>
//                                           if(msg.user === 'Player 2')
//                                               return <div className="msg-send">{msg.text}</div>
//                                       })}
//                                   </div>
//                                   <div className="chat-text">
//                                       <input type='text' placeholder='Type a message...' value={message} onChange={event => setMessage(event.target.value)} onKeyPress={event => event.key==='Enter' && sendMessage(event)} />
//                                   </div>
//                               </div>
//                           </div>
//                       </div> </> }
//                   </div> }
//               </> }
//           </> : <h1>Room full</h1> }

//           <br />
//           <a href='/'><button className="game-button red">QUIT</button></a>
//       </div>
//   )
// }

// export default Game


















































































// function Game() {
    
//     //initialize socket state // I DON'T NEED THIS, THE GAME ALREADY KEEPS TRACK OF THIS IN THE ATTRIBUTES OF THE USERS THAT ARE WITHIN ANY GIVEN GAME ROOM!
//     // const [name, setName] = useState('');
//     // const [room, setRoom] = useState('');
//     // const [users, setUsers] = useState([]);
//     // const [currentUser, setCurrentUser] = useState('');
    

//     //Initialize Game State
//     const [role, setRole] = useState('')
//     const [players, setPlayers] = useState([])
//     const [leaderboard, setLeaderboard] = useState([])
//     const [messages, setMessages] = useState([])
//     const [round, setRound] = useState(0)
//     const [word, setWord] = useState('')
//     const [images, setImages] = useState([])
//     const [currentImage, setCurrentImage] = useState('')
//     const [room, setRoom] = useState('')


//     const ENDPOINT = 'http://localhost:3001';

    
//     const isInitialMount = useRef(true); //I am only including this "useRef" thing here to prevent the useHook from mounting twice (while I'm in development), this is a know React issue (https://stackoverflow.com/questions/72238175/useeffect-is-running-twice-on-mount-in-react)

//     //first when a user enters a room we will retrieve their information (name and room-name) from their query string, and update the "name" and "room" state variables accordingly 
//     useEffect(() => {

//       if (isInitialMount.current) {  //Note: I am only including this block here to prevent the useHook from mounting twice (while I'm in development), this is a know React issue (https://stackoverflow.com/questions/72238175/useeffect-is-running-twice-on-mount-in-react)
//         isInitialMount.current = false; //...and change the value to "false" for next time :)
//      } else {

//       //i.e. a "socket" is just each individual browser that's trying to connect to our endpoint (which in this case is the server, i.e. localhost:3001)
//       const socket = io(ENDPOINT); 

//       //This sets the variable "name" to be the user's name, and the variable "room" to be the name of the room the user entered (from the initial join screen that we took out of the URL parameters)
//         // const { name, room } = queryString.parse(window.location.search) // the variable "location" actually comes from React Router and it gives us a prop called "location"(?)
//         const data = queryString.parse(window.location.search)
//         const name = data.name
//         const room = data.room
//         const id = socket.id

//         // console.log(name)
//         // console.log(room)
//         // console.log(socket)
      

//         socket.emit('join', ( {name:name, room:room} )); //this one works fine

//         socket.emit('initialGameStateRequest')
//         socket.on('initialGameStateResponse', (role, players, leaderboard, messages, round, word, images, currentImage) => {
//           setRole(role)
//           setPlayers(players)
//           setLeaderboard(leaderboard)
//           setMessages(messages)
//           setRound(round)
//           setWord(word)
//           setImages(images)
//           setCurrentImage(currentImage)
//           setRoom(room)
//           console.log(role)
//           console.log(players)
//           console.log(round)
//           console.log(word)
//         })




//         socket.on('activeGameStateRequest', (message) => {
//           console.log(message)
//           console.log("IT'S WORKING!!!")
//       })
   




//     }}, [ENDPOINT, window.location]); //the end little array part here will make it so the "useEffect" hook only actually run if either the ENDPOINT or window.location changes





//     // useEffect(() => {}) //this is just a formatting example I put here that I can copy/paste from
  

//     return (
//         // I WANT TO MAKE IT SO IF THE USER IS A DRAWING-PLAYER IT WILL DISPLAY AN INPUT BOX,
//         //...AND IF THE USER IS A GUESSING_PLAYER IT WILL DISPLAY SOMETHING ELSE
//       <div>
//         <h1>Placeholder Text</h1> {/* //<------this is the actual thing that gets rendered from this component!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */}
//         {/* // <button>Start</button> // */}
//       </div>
//     )

// }

// export default Game