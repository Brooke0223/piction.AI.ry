import React, { useState } from 'react';
import { useNavigate } from "react-router-dom"
import Footer from '../components/footer';
import TutorialModal from '../components/TutorialModal';
import './Join.css'




const Join = () => {
    let navigate = useNavigate(); //This allows us to link user to another page in the pop-up alert window
    
    const [openModal, setOpenModal] = useState(false)
    const [gameCode, setGameCode] = useState('')

    const generateGameCode = () => {
        return Math.random().toFixed(4).slice(2, 6);    
    }

    const checkGameCode = () => {
        if(gameCode.length !== 4 && typeof(gameCode) !== 'number'){
            setGameCode('')
            alert('Please enter a valid Game Code')
        }
        else{
            navigate(`/game?room=${gameCode}`)
        }
    }
    

    return (
    <div>
        <TutorialModal open={openModal} setOpenModal={setOpenModal}/>

        <div className='body'> 
            <div className="container">
                <div className="navbar">
                    <div></div>
                    <img className ="logo" src={require('../assets/pictionary-logo.png')}></img>
                    <svg xmlns="http://www.w3.org/2000/svg" height="10%" fill="white" class="bi bi-question-circle link" viewBox="0 0 16 16" title="Click here to learn more about the game" onClick={() => setOpenModal(true)} >
                        <title>Click here to learn more about the game</title>
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                    </svg>
                </div>


                <div className='join-form row'>
                    <form className="row g-3" onSubmit={checkGameCode}>
                        <div className='col-lg-6 col-xs-12 homepage-join my-auto'>
                            <h1 className='new-game-option'>Join Game</h1>
                            <div>
                                <input type='text' value={gameCode} placeholder='Game Code' onChange={(event) => setGameCode(event.target.value)} ></input>
                                <button type='submit' class="btn btn-white btn-animate join-btn">Join</button>
                            </div>
                        </div>

                        <div className='col-lg-6 col-xs-12 homepage-create my-auto'>
                            <h1 className='new-game-option'>Create Game</h1>
                            <button class="btn btn-white btn-animate create-btn" onClick={() => navigate(`/game?room=${generateGameCode()}`)}>Create New Game</button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer/>
        </div>
    </div>
    )
}



export default Join;









{/* <div className="joinOuterContainer"> */}
{/* <div className="joinInnerContainer"> */}
    {/* <h1 className = "heading">Join</h1> */}
    {/* <div><input placeholder="Enter name" className="joinInput" type="text" onChange={(event) => setName(event.target.value)} /></div> */}
    {/* <div><input placeholder="Enter room" className="mt-20" type="text" onChange={(event) => setRoom(event.target.value)} /></div>    'mt-20' means "margin-top 20" in his speak */}
    
    {/* Note the ternary operator (i.e. if they don't enter BOTH a username and room-name, then we don't link them anywhere, because that would obviously break our app!) */}
    {/* <Link onClick={event => (!name || !room) ? event.preventDefault() : null} to={`/game?name=${name}&room=${room}`}>   i.e. I am going to link them to a specific room based on the name/room they inputted (I will link them and put that data into the URL as query parameters), BUT HE SAID WE COULD'VE DONT THIS BY PASSING PROPS, TOO???? */}
        {/* <button className="button mt-20" type="submit">Sign In</button> */}
    {/* </Link> */}

{/* </div> */}
{/* </div> */}