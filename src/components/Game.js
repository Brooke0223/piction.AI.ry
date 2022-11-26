//NOTE: useRef is only being used here to compensate for the useEffect Hook rendering twice on each mount (known React glitch when in production). https://stackoverflow.com/questions/72238175/useeffect-is-running-twice-on-mount-in-react
import React, { useState, useEffect, useRef } from "react"; //lets us have state variable
import queryString from 'query-string'; // lets us retrieve data that is present as a query in the URL
import io from 'socket.io-client';
// import { terms } from "../terms"; //THIS IS THE LIST OF WORDS TO GUESS FROM!!!!!
import './Game.css'
import placeholderImage from '../assets/placeholder.jpeg';
import Tutorial from "./Tutorial";


const ENDPOINT = window.location.origin
const connectionOptions =  {
  "forceNew" : true,
  "reconnectionAttempts": "Infinity", 
  "timeout" : 10000,                  
  "transports" : ["websocket"]
}

const socket = io(ENDPOINT, connectionOptions); 



const Game = (props) => {

  const data = queryString.parse(window.location.search)
  const name = data.name
  const room = data.room
  
  
  //Initialize user state
  const [ready, setReady] = useState(false)
  const [joined, setJoined] = useState(false)
  const [role, setRole] = useState('')
  

  //Initialize game state
  const [tutorial, setTutorial] = useState(false)
  const [round, setRound] = useState(0)
  const [numRounds, setNumRounds] = useState(0)
  const [word, setWord] = useState('')
  const [searchTerms, setSearchTerms] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [imageOptions, setImageOptions] = useState([])
  const [image, setImage] = useState(placeholderImage)
  const [selectedImages, setSelectedImages] = useState([placeholderImage])
  const [guessInput, setGuessInput] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [matchMakingRequested, setMatchMakingRequested] = useState(false)
  const [difficulty, setDifficulty] = useState(3)


  const [expirationTime, setExpirationTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState({minutes:1, seconds:0});
  

  
  // ***REINSTATE THIS CODE-BLOCK BEFORE PUSHING TO GITHUB!!!!! (MAKES IT WORK W/ PARTNER'S MICROSERVICE)***
  // retrieve from partner's API the details of the game room (i.e. public/private, number of rounds, difficulty)
  // const roomId = 'apple-unicorn-antarctica' //replace this with the actual "room" variable once my partner gets his API fully up-and-running
  // const proxy_url = 'https://cors-anywhere.herokuapp.com/'; //replace the CORS proxy when the app is deployed
  // fetch('https://cs-361-microservice.herokuapp.com/game/' + roomId) //also replace this with the actual "room" variable once my partner gets his API fully up-and-running
  const CollectData = async () => {
    let data = await fetch('https://cs-361-microservice.herokuapp.com/game/' + room) //also replace this with the actual "room" variable once my partner gets his API fully up-and-running
    data = await data.json();
    if(data){
      
      //save the room variables that get returned from the API
      setMatchMakingRequested(data.matchmakingRequested)
      setDifficulty(data.difficulty)
      setNumRounds(data.numberOfRounds)
    
      
      setJoined(true)
      //When a new socket joins, let the server know the socket's name, room number, etc. so the server can add that socket to that socket-room
      socket.emit('join', room, name, data.matchmakingRequested, data.difficulty, data.numberOfRounds) ////When a new socket joins, let the server know the socket's name, room number, and room privacy so the server can add that socket to that socket-room

    }
  }

  // Player Data will fetch once upon page mount
  useEffect(() => {
    CollectData()
  }, [])


  //***REMOVE THIS CODE-BLOCK BEFORE PUSHING TO GITHUB!!!!! (MAKES IT WORK W/ ON LOCAL HOST)***
  //When a new socket joins, let the server know the socket's name and room number so the server can add that socket to that socket-room
  // if(joined === false){
  //   setJoined(true)
  //   socket.emit('join', room, name)
  // }  

  
  //When the user clicks "Start", update server that the player is ready to begin
  const onStartGameHandler = () => {
    setReady(true)
    socket.emit("start")
  }

  //When the user clicks "Learn More" on the initial screen, change so they can only see the tutorial info
  const onStartTutorialHandler = () => {
    if (window.confirm("Would you like to leave the game room to learn more about how the game is played?")) {
      setTutorial(true)
    }
  }

  //When a user currently in the "Tutorial" screen clicks the back button (to exit the tutorial)
  const onEndTutorialHandler = () => {
    setTutorial(false)
  }    


  //When the drawing-user clicks to "submit" their search terms, check to make sure they've actually entered something, and what they've entered doesn't contain the word itself!
  const checkSearchTerms = (e) => {
    e.preventDefault();

    //if they haven't actually entered anything into the input box (i.e. "searchTerms" === '')
    //...just don't do anything (this is an invalid request that would bug-out our API request)
    if(searchTerms === ''){
      return
    }

    //check if the message and that round's word match (everything lowercase)
    if(searchTerms.toLowerCase().includes(word.toLowerCase())){
      alert("Your search terms may not include the round's key word!")
      return
    }

    //If it passes both of those tests, we can now submit those search terms
    submitSearchTerms()
  }


  //When the drawing-user clicks to "submit" their search terms
  const submitSearchTerms = () => {

    const formattedSearchTerms = searchTerms.split(' ').join('+');
    setSearchTerms('') //I should clear out the search terms so the input goes back to the placeholder?
    // console.log(formattedSearchTerms)

    // send request to the API
    // const proxy_url = 'https://cors-anywhere.herokuapp.com/';
    // fetch(proxy_url+ 'https://lexica.art/api/v1/search?q=' + formattedSearchTerms)
    fetch('https://lexica.art/api/v1/search?q=' + formattedSearchTerms)
      .then(response => response.json())
      .then(data => {

    //save the first four images returned by the API
    const image1 = data.images[0].src
    const image2 = data.images[1].src
    const image3 = data.images[2].src
    const image4 = data.images[3].src

    setImageOptions([image1, image2, image3, image4])
    })
  }


  //When the drawing user clicks (selects) one of their 4 image options
  const clickChange = (e) => {
    if (window.confirm("Confirm to send this image")) {
      
      //clear the imageOptions array
      setImageOptions([])

      //add the selected image to the list we keep of the user's selected images for this round (for undo/redo purposes)
      setSelectedImages([...selectedImages, e]);

      //notify the server that it needs to update the display image for the entire room (i.e. it needs to return something that will 'setImage')
      socket.emit('updateImageRequest', e)
    }
  }




  //When a Drawing-User clicks the "Undo" button (wants to revert to a previously-sent image)
  const onUndoImageHandler = () => {
    //if the Drawing-User is currently reviewing their image options (i.e. "imageOptions" !==0)
    //...just clear out the "imageOptions" array, and that will make their view go back to viewing the "image" (don't need to change the "Guessing-Player"'s view since they couldn't see their preview images anyways)
    if(imageOptions.length !== 0){
      setImageOptions([])
      return //this makes it so the rest of the block of code will not be executed if this part was true (so the rest of the block of code is basically just our "else" statement)
    }
    
    //otherwise is the Drawing-User is NOT currently reviewing their image options (i.e. "imageOptions" === 0)
    //...check what index the current "image" is set to in the "selectedImages" array
    const index = selectedImages.indexOf(image)

    //if it's at index 0, just return (since it is an invalid "undo" request)
    //otherwise, set the "image" to be whatever image is at the previous index in the "selectedImages" array
    if(index !== 0){
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
    if(index !== selectedImages.length-1){
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
  

  //Stop the timer when the Guessing-Player guesses the word
  const stopTimer = () => {
    setExpirationTime(0) //I am doing this so the timer will stop counting down (it only counts down as long as things are negative)
  }
  

  //When the Guessing-User submits a guess (i.e. a message)
  const submitMessage = (e) => {
    e.preventDefault();
    // console.log(message)
    
    //check if the message and that round's word match (everything lowercase)
    if(message.toLowerCase().includes(word.toLowerCase())){
      stopTimer()
      
      //only display this if this is not the final round!
      if(numRounds !== round){
        alert('You guessed it! You will now be the Drawing-Player')
      }

      socket.emit('numCorrectWordsRequest') //if the message matches that round's word, let the server know to update the numCorrectWords
      socket.emit('nextRoundRequest', round) //if the message matches that round's word, let the server know to update to the next round
    }else{ 
      socket.emit('addMessageRequest', message) //if the message and that round's word do NOT match, let the server know to send that message back to all the players in the room so that it can be added to everyone's array of messages (I will use the array to map out the messages in a chat box)
    }

    setMessageInput('') //I should clear out the individual message so the input box goes back to showing the placeholder
    setGuessInput('') //I should clear out the individual message so the input box goes back to showing the placeholder
  }


  //When the game is over, display the % of correctly guessed words, and reload the page (so the user can choose to either play again or view the tutorial)
  const endGame = (percentage) => {
    alert(`Game over! You and your partner correctly guessed ${percentage}% of the words!`)
    // window.location.reload()
  }


  //This function will continually calculate how much time is left by comparing the current time to the time that the server sent over originally with the new round start
  const calculateTimeLeft = (exp) => {
    const difference =  exp - new Date();

    if(difference >= 0){
      setTimeLeft({
        minutes: Math.floor(difference / 1000 / 60),
        seconds: Math.floor(difference / 1000),
      });
    }
  };


  //This sets an interval to keep calling the above "calculateTimeLeft" function until it reaches zero
  let timerId = setTimeout(calculateTimeLeft, 1000, expirationTime);
  if(timeLeft.minutes === 0 && timeLeft.seconds === 0 && role==='Drawing-Player'){ //I don't want both players to send the next-round request
    clearInterval(timerId)
    socket.emit('nextRoundRequest', round) //this works but I think I should do it as a like 'timeOutRequest' emit thing, that way the server can tell the game to display back "Brooke ran out of time! Shaun will be the next drawing-player"
  }



  // const isInitialMount = useRef(true); //I am only including this "useRef" thing here to prevent the useHook from mounting twice (while I'm in development), this is a known React issue (https://stackoverflow.com/questions/72238175/useeffect-is-running-twice-on-mount-in-react)
  // useEffect(() => {
  
  // if (isInitialMount.current) {  
  //         isInitialMount.current = false; //...and change the value to "false" for next time :)
  //      } else {
    
  //   // //When a new socket joins, let the server know the socket's name and room number so the server can add that socket to that socket-room
  //   // socket.emit('join', room, name)
    
  //   //Upon joining, the socket returns back what that user's initial role will be
  //   socket.on('setRole', role => {
  //     setRole(role)
  //     console.log(role)
  //   })

  //   //Game begins when server let's sockets know that both users have clicked "start"
  //   socket.on('start-game', (word) => {
  //     console.log("I MADE IT TO HERE, FUCK YEAH!!!!!")
  //     setRound(1)
  //     setWord(word)
  //     // console.log("I set the round to 1")
  //     // console.log("word")
  //   })

  //   //When a drawing-user selects a new display image, the server informs all sockets to update their image
  //   socket.on('updateImageResponse', (image) => {
  //     setImage(image)
  //   })

  //   //When a drawing-user passes their turn or a guessing-user guesses the word correctly, the server informs all sockets to update their round #, their word, and reset any new round variables (like "image", "imageOptions", "searTerms", and "selectedImages")
  //   socket.on('nextRoundResponse', (round, word) => {
  //     setRound(round)
  //     setWord(word)
  //     setImage(placeholderImage)
  //     setSearchTerms('')
  //     setImageOptions([])
  //     setSelectedImages([placeholderImage])
      
  //   })

    
  //   //When a drawing-user or guessing-user submits a guess and/or message that DOESN'T MATCH that round's word, the server informs all sockets to add that message to their messages array
  //   socket.on('addMessageResponse', (message) => {
  //     // setMessages(messages => [...messages, message]) //add the message to the users messages array
  //     setMessages(messages => [...messages, message]) //add the message to the users messages array
  //     console.log(messages)
  //   })

    
  // }}, [socket])


      //Upon joining, the socket returns back what that user's initial role will be
      socket.on('setRole', role => {
        setRole(role)
        console.log(role)
      })
  
  
      //When a drawing-user selects a new display image, the server informs all sockets to update their image
      socket.on('updateImageResponse', (image) => {
        setImage(image)
      })
  
      //When a drawing-user passes their turn or a guessing-user guesses the word correctly, the server informs all sockets to update their round #, their word, and reset any new round variables (like "image", "imageOptions", "searTerms", and "selectedImages")
      socket.on('nextRoundResponse', (round, word, expTime) => {
        setRound(round)
        setWord(word)
        setImage(placeholderImage)
        setSearchTerms('')
        setImageOptions([])
        setSelectedImages([placeholderImage])
        setTimeLeft({})

        setExpirationTime(expTime)
        calculateTimeLeft(expTime)
      })
      

      // When the end of the game has been reached, let the players know the final percentage, and refresh the page so they can either start again or not
      socket.on('endGameRequest', (percentage) => {
        
        //I'm only implementing it like this (with the "round !===" thing) because otherwise it was rendering like 7-8 times with a million alerts?????
        if(round !== -1){
          alert(`That concludes the game! Together you guessed ${percentage}% of the words!`)
          window.location.reload()
          round = -1
        }  

      })
      

      //When a drawing-user or guessing-user submits a guess and/or message that DOESN'T MATCH that round's word, the server informs all sockets to add that message to their messages array
      socket.on('addMessageResponse', (message) => {
        // setMessages(messages => [...messages, message]) //add the message to the users messages array
        setMessages(messages => [...messages, message]) //add the message to the users messages array
        console.log(messages)
      })
  
  
  // useEffect(() => {
  //   setTimeout(() => {
  //     calculateTimeLeft(expirationTime);
  //   }, 1000);
  // });
  


  return (
    <div>
      
      {/* BOTH PLAYERS SEE THE NAV BAR */}
      <nav class="navbar navbar-inverse">
        <div class="container-fluid">
          <div class="navbar-header">
            <a class="navbar-brand text-secondary">piction.AI.ry</a>
          </div>
        </div>
      </nav>
      

      {/* BOTH PLAYERS SEE THE INITIAL START-UP SCREEN */}
      {(tutorial !== true) && <h4 class="text-center">Game Room: {room}</h4>}
      {(!ready && tutorial === false) && <button onClick={onStartGameHandler}>Play Game</button>}
      {(!ready && tutorial === false) && <button onClick={onStartTutorialHandler}>Learn More</button>}
      
      {/* TUTORIAL SCREEN */}
      {(!ready && tutorial === true) && 
          <>
            <Tutorial/>
            <button onClick={onEndTutorialHandler}>Back</button>
            <br/>
            <br/>
            <br/>
          </>
      }

      {/* AWAITING PLAYER START SCREEN */}
      {(ready && round === 0) && <h1>Waiting for other player to Click Start</h1>}
      
      
      {/* MAIN GAME SCREEN FOR BOTH PLAYERS */}
      {(ready && round !== 0 && imageOptions.length === 0)  && 
        <>
            <h4>Round: {round}</h4>
            <h4>           
              <span>{timeLeft.minutes}</span>
              <span>:</span>
              <span>{timeLeft.seconds > 9 ? timeLeft.seconds : '0' + timeLeft.seconds}</span>
            </h4>
            <h1 class="text-center">You are the {role}!</h1>
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
          <form onSubmit={checkSearchTerms}>
            <input type="text" value={searchTerms} onChange={event => setSearchTerms(event.target.value)} placeholder='Enter your search terms'/>
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
          <input type="text" value={guessInput} onChange={event => setMessage('*** '+name+' GUESSED: "'+event.target.value+'" ***', setGuessInput(event.target.value))} placeholder='Enter your guesses'/>
          {/* <input type="text" value={message} onChange={event => setMessage(event.target.value)} placeholder='Enter your guesses here'/> */}
          <input type="submit"/>
        </form>
        </>}



        {/* EVERYONE CAN SEE THE MESSAGE INPUT BOX */}
        {/* {(round !== 0) && <>
        <form onSubmit={submitMessage}>
          <br></br>
          <input type="text" value={messageInput} onChange={event => setMessage(name +': '+event.target.value, setMessageInput(event.target.value))} placeholder='Enter your message here'/> */}
          {/* <input type="text" value={message} onChange={event => setMessage(event.target.value)} placeholder='Enter your guesses here'/> */}
          {/* <input type="submit"/>
        </form>
        {messages}
        </>} */}
      
      


      {/* {role === 'Drawing-Player'
      ? <h1>You are a drawing player</h1>
      : <h1>You are a guessing player</h1>
      } */}
    </div>
  )
}

export default Game