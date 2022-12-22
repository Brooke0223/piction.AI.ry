import React, { useState, useEffect } from 'react'; //lets us have state variable
import queryString from 'query-string'; // lets us retrieve data that is present as a query in the URL
import io from 'socket.io-client';
// import { terms } from "../terms"; //THIS IS THE LIST OF WORDS TO GUESS FROM!!!!!
import './Game.css';
import placeholderImage from '../assets/placeholder.jpeg';
import TimerModal from '../components/TimerModal';
import ButtonModal from '../components/ButtonModal';
import Footer from '../components/footer';


const ENDPOINT = window.location.origin
const connectionOptions = {
  'forceNew' : true,
  'reconnectionAttempts': 'Infinity',
  'timeout' : 10000,
  'transports' : ['websocket']
}
const socket = io(ENDPOINT, connectionOptions);




function Game() {
  
  //Initialize user state
  const [joined, setJoined] = useState(false)
  const [ready, setReady] = useState(false)
  const [role, setRole] = useState('')
  

  //Initialize game state
  const room = queryString.parse(window.location.search).room
  const [alertModal, setTimerModal] = useState(false) //having this "true" will let us just see what it looks like (otherwise it's default value would be "false" to have it be closed)
  const [endModal, setButtonModal] = useState(false) //having this "true" will let us just see what it looks like (otherwise it's default value would be "false" to have it be closed)
  const [modalMessage, setModalMessage] = useState('')
  const [tutorialModal, setTutorialModal] = useState(false)
  const [roomFull, setRoomFull] = useState(false)
  const [round, setRound] = useState(0)
  const [word, setWord] = useState('')
  const [searchTerms, setSearchTerms] = useState('')
  const [imageOptions, setImageOptions] = useState([])
  const [image, setImage] = useState(placeholderImage)
  const [selectedImages, setSelectedImages] = useState([placeholderImage])
  const [guess, setGuess] = useState('')
  
  const [roundExpirationTime, setRoundExpirationTime] = useState(0)
  const [modalExpirationTime, setModalExpirationTime] = useState(0)
  const [roundTimeLeft, setRoundTimeLeft] = useState({});
  
  
  // When a new socket joins, let the server know the socket's name and room number so the server can add that socket to that socket-room
  if(joined === false){
    setJoined(true)
    
    socket.emit('join', room, (error) => {
      if(error)
        setRoomFull(true)
    })
  }  

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
  socket.on('nextRoundResponse', (round, word, roundExpTime, modalExpTime) => {
    setRound(round)
    setWord(word)
    setImage(placeholderImage)
    setSearchTerms('')
    setImageOptions([])
    setSelectedImages([placeholderImage])
    
    setRoundExpirationTime(roundExpTime)
    setModalExpirationTime(modalExpTime)
    setRoundTimeLeft({})

    setTimerModal(true)
    setModalMessage('Time ran out! Your partner draws next.')
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

  const readyHandler = () => {
    setReady(true)
    socket.emit('readyRequest')
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
  
  //Stop the timer when the Guessing-Player correctly guesses the word
  const stopTimer = () => {
    setRoundTimeLeft({})
  }
  
  //When the Guessing-User submits a guess (i.e. a message)
  const submitGuess = (e) => {
    e.preventDefault();
    
    //check if the message and that round's word match (everything lowercase)
    if(guess.toLowerCase().includes(word.toLowerCase())){
      stopTimer()
      
      socket.emit('numCorrectWordsRequest') //if the message matches that round's word, let the server know to update the numCorrectWords
      socket.emit('nextRoundRequest', round) //if the message matches that round's word, let the server know to update to the next round
    }
    setGuess('') // clear the "guess" input every time a user submits a guess
  }




  // //This function will continually calculate how much time is left by comparing the current time to the time that the server sent over originally with the new round start
  const calculateRoundTimeLeft = () => {
    let currentTime = Math.floor(Date.now()/1000);
    const difference =  roundExpirationTime - currentTime;
    if(difference >= 0){
      // console.log(`The difference is ${difference}`)
      setRoundTimeLeft({
        minutes: Math.floor(difference / 60),
        seconds: Math.floor((difference / 60 - Math.floor(difference / 60)) * 60),
      });
    }
  };

  
  // //This sets an interval to keep calling the above "calculateTimeLeft" functions until they reach zero
  let roundTimerId = setTimeout(calculateRoundTimeLeft, 1000);

  if(roundTimeLeft.minutes === 0 && roundTimeLeft.seconds === 0 && role==='Drawing-Player'){ //I don't want both players to send the next-round request
    stopTimer()
    clearInterval(roundTimerId)
    socket.emit('nextRoundRequest', round) //this works but I think I should do it as a like 'timeOutRequest' emit thing, that way the server can tell the game to display back "Brooke ran out of time! Shaun will be the next drawing-player"
  }

  

  return (
    <div>

      
      <div className="game-body">
        
        <div className="modal-wrapper">
          <TimerModal open={alertModal} setOpen={setTimerModal} expTime={modalExpirationTime} modalMessage={modalMessage}/>
        </div>
      
        <ButtonModal open={endModal} setOpen={setButtonModal} />
      



      
      
      
      
        {/* NAV BAR */}
        {/* <div className='body'>  */}  {/* NOTE: If I switch between the <div> tag of className container/body, it will take the CSS properties from Game.css(?) and put the pencil background image onto the main Game page */} 
        <div className="nav-wrapper">
            <div className="container nav">
                <a href="#" className="logo-wrapper">
                  <img className="game-logo" alt="logo" src={require('../assets/pictionary-logo.png')}></img>
                </a>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" class="bi bi-question-circle" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                </svg>
            </div>
        </div>
        

        <div className="container main-wrapper">
          <div className="container info-wrapper">
              {/* WHAT A PLAYER SEES IF THE ROOM IS ALREADY FULL */}
              {(roomFull === true) && <h4 class="text-center">THE ROOM IS FULL!</h4>}

              {/* AWAITING PLAYER START SCREEN */}
              {(roomFull !== true && round === 0) && <h2 class="text-center">Room: {room}</h2>}
              {(ready === true && round === 0) && <h4>--Waiting for another player to join--</h4>}
              {(ready === false && roomFull === false) && <button class="btn btn-white btn-animate create-btn" onClick={() => readyHandler()}>Start</button>}
              
              {/* GAME INFO FOR BOTH PLAYERS */}
              {(round !== 0 && roundTimeLeft)  && 
                <>
                    <h3 class="text-center">You are the {role}!</h3>
                    <h4>Room: {room} | Round: {round}</h4>
                   
                </>
              }
              {/* TIMER FOR BOTH PlAYERS (ONLY APPEARS AFTER MODAL CLOSES) */}
              {(round !== 0 && alertModal===false)  && 
                <h4>           
                <span>{roundTimeLeft.minutes}</span>
                <span>:</span>
                <span>{roundTimeLeft.seconds > 9 ? roundTimeLeft.seconds : '0' + roundTimeLeft.seconds}</span>
              </h4>
              }
          </div>
          
          <div className="container-fluid">
              {/* MAIN IMAGE DISPLAY FOR BOTH PLAYERS */}
              {/* {(round !== 0 && imageOptions.length === 0 && roundTimeLeft)  &&  <img id="display-image" width="500" height="300" src={image}/>} */}
              {(round !== 0 && imageOptions.length === 0 && roundTimeLeft)  &&  <img id="display-image" src={image}/>}

              {/* DRAWING-PLAYER VIEW */}
              {(role === 'Drawing-Player' && imageOptions.length !== 0) &&
                <div className="row">{imageOptions.map((image, index) => {
                  return (
                    <div key={index} id={"image"+index} className="col-sm-6 col-xs-12">
                      <img width="250" height="150" onClick={() => clickChange(image)} src={image}/>
                    </div>
                  );
                })}
                </div>}

                {/* DRAWING-PLAYER'S WORD (ONLY APPEARS AFTER MODAL CLOSES) */}  
                {(role === 'Drawing-Player' && round !== 0 && alertModal===false)  && 
                <h4 title="This is the word you're trying to get the other players to guess">Your word is: {word}</h4>
                }

                {/* DRAWING-PLAYER'S SUBMIT FORM */}  
                {(role === 'Drawing-Player' && round !== 0) && <>
                  <form onSubmit={checkSearchTerms}>
                    <input type="text" value={searchTerms} onChange={event => setSearchTerms(event.target.value)} placeholder='Enter search terms'/>
                    <button type='submit' class="btn btn-white btn-animate join-btn">Submit</button>
                  </form>
                  <button title="Don't like your image? Unsend this image" onClick={onUndoImageHandler}>Undo</button>
                  <button title="Don't like your image? Resend previous image" onClick={onRedoImageHandler}>Redo</button>
                  <button title="Pass Your Turn" onClick={onPassHandler}>PASS</button>
                  </>}


                {/* GUESSING-PLAYER VIEW */}
                {(role === 'Guessing-Player' && round !== 0) && <>
                <form onSubmit={submitGuess}>
                  <br></br>
                  <input type="text" value={guess} onChange={event => setGuess(event.target.value)} placeholder='Enter your guesses'/>
                  <button type='submit' class="btn btn-white btn-animate join-btn">Submit</button>
                </form>
                </>}
            </div>
          </div>
          <Footer id="footer"/>
        </div>
    </div>
  )
}

export default Game