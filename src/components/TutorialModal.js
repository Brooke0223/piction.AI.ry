import React from 'react'
import drawingPlayerScreenshot from '../assets/drawing-player.png';
import guessingPlayerScreenshot from '../assets/guessing-player.png';
import './TutorialModal.css'


function TutorialModal({open, setOpenModal}) {
    if(!open) return null

    return (
    <div className="container-fluid tutorial-modal-background" onClick={() => setOpenModal(false)}>
        <div className="container tutorial">
            <br/>
            <div className="top-notepad">
                {/* <button type="button" class="btn btn-secondary exitButton" onClick={() => setOpenModal(false)}>x</button> */}
                <img className ="logo" src={require('../assets/pictionary-logo.png')}></img>
            </div>
            <br/>
            <h2 class="header tutorial-contents">☑ What is piction.AI.ry?</h2>
                <p className="tutorial-contents">
                    Piction.AI.ry is a two-player drawing/guessing game which utilizes the Stable Diffusion text-to-image AI model to generate user “drawings.” Much like old-school drawing/guessing games, players will take turns acting as the “Drawing-Player” or “Guessing-Player,” and must work together to communicate each round’s word using only AI-generated images based on text queries.
                </p>
            <br/>
            <h2 class="header tutorial-contents">☑ How to play piction.AI.ry</h2>
                <ul class="tutorial-contents">
                    <li class="tutorial-contents">At the start of each new game, players will be randomly designated the Drawing-Player or Guessing-Player for the initial round. The role of a player can be found near the top of the playing screen.</li>
                </ul>

            <br/>
            {/* <div className="card-body">
                <img class="card-img-top img-fluid" src={drawingPlayerScreenshot}/>
                <img class="card-img-top img-fluid" src={guessingPlayerScreenshot}/>
            </div> */}
            <div class="card-group">
                <div class="card" >
                    <img class="card-img-top" src={drawingPlayerScreenshot} alt="Card image cap"/>
                </div>
                <div class="card">
                    <img class="card-img-top" src={guessingPlayerScreenshot} alt="Card image cap"/>
                </div>
            </div>
            <br/>
            <br/>

            <ul class="tutorial-contents">
                <li class="tutorial-contents">The Drawing-Player is provided with the keyword for that round, and a textbox that can be used to query the AI.</li>
                <li class="tutorial-contents">The Drawing-Player will have 60 seconds to submit prompts to the AI, being careful not to include the actual word itself.</li>
                <br/>
                <li class="no_bullet tutorial-contents"> <b>Example keyword: </b> <em>“Veterinarian”</em> </li>
                <li class="no_bullet tutorial-contents"> <b>Example query:  </b> <em>“A smiling person in a white lab coat holding a small dog”</em> </li>
                <br/>
                <li class="tutorial-contents">The AI will generate 4 image options and display them <b>to the Drawing-Player only.</b> The Drawing-Player can select the one image that most embodies that round’s keyword and have this image sent to the Guessing-Player, or they can submit a new query to the AI image generator to create 4 new image options. There is no limit to the number of images that may be sent during a round.</li>
                <br/>
                <li class="no_bullet tutorial-contents"> <b>NOTE:</b> The Guessing-Player will not be shown an image until the Drawing-Player selects and confirms that image (i.e. they will not be shown the querying terms, nor the 4 returned image options). </li>
                <br/>
                <li class="tutorial-contents">At any time during the Drawing-Player’s turn, they can undo/redo their previously sent images by clicking the Undo/Redo buttons, or can choose to pass their turn.</li>
                <li class="tutorial-contents">The round is over when either the Guessing-Player correctly guesses the word, the Drawing-Player chooses to pass their turn, or the timer runs out.</li>
                <li class="tutorial-contents">When a round is over, the players will then switch roles and a new round will begin.</li>
                <li class="tutorial-contents">The game will end when all of the pre-selected number of rounds have been completed.</li>
                <li class="tutorial-contents">Users will be shown the percentage of words successfully guessed during that game<em>–can you manage 100%?</em> </li>
            </ul>        
            <br/>
            <br/>
            <h2 class="header tutorial-contents">☑ How to write stronger piction.AI.ry prompts</h2>
            <p class="tutorial-contents"> (credit: <a href="https://github.com/midjourney/docs/blob/main/resource-links/guide-to-prompting.md">https://github.com/midjourney/docs/blob/main/resource-links/guide-to-prompting.md</a>)</p>
            
            <hr class="solid"></hr>
            <h5 class="tutorial-contents">Anything left unsaid may surprise you</h5>
            <p class="tutorial-contents">You can be as specific or as vague as you want, but anything you leave out will be randomized. Being vague is a great way to get variety, but you may not get what you’re looking for.</p>
            <p class="tutorial-contents">Try to be clear about any context or details that are important to you.</p>

            <hr class="solid"></hr>
            <h5 class="tutorial-contents">Try visually well-defined objects</h5>
            <p class="tutorial-contents"><em>(something with a lot of photos on the internet)</em></p>
            <p class="tutorial-contents"><b>Try:</b> Wizard, priest, angel, emperor, rockstar, city, queen, Zeus, house, temple, farm, car, landscape, mountain, river</p>
            
            <hr class="solid"></hr>
            <h5 class="tutorial-contents">Try invoking a particular <em>medium</em></h5>
            <p class="tutorial-contents">If the style is unspecified, it will lean towards photorealism</p>
            <p class="tutorial-contents"><b>Examples: </b>“a watercolor painting of a landscape” “a child's drawing of a home”</p>
            <p class="tutorial-contents"><b>Try: </b>painting, drawing, sketch, pencil drawing, woodblock print, matte painting, child's drawing, charcoal drawing, an ink drawing, oil on canvas, graffiti, watercolor painting, fresco, stone tablet, cave painting, sculpture, work on paper, needlepoint</p>

            <hr class="solid"></hr>
            <h5 class="tutorial-contents">Speak in positives. Avoid negatives</h5>
            <p class="tutorial-contents">Language models often ignore negative words (“not” “but” “except” “without”).</p>
            <p class="tutorial-contents"><b>Avoid: </b>“a hat that’s not red”</p>
            <p class="tutorial-contents"><b>Try: </b>“a blue hat”</p>
            <br/>
            <p class="tutorial-contents"><b>Avoid: </b>“a person but half robot”</p>
            <p class="tutorial-contents"><b>Try: </b>“half person half robot”</p>

            <hr class="solid"></hr>
            <h5 class="tutorial-contents">Specify what you want clearly</h5>
            <p class="tutorial-contents"><b>Avoid: </b>“monkeys doing business”</p>
            <p class="tutorial-contents"><b>Try: </b>“three monkeys in business suits”</p>

            <hr class="solid"></hr>
            <h5 class="tutorial-contents">If you want a specific composition, say so!</h5>
            <p class="tutorial-contents"><b>Examples:  </b>“a portrait of a queen” “an ultrawide shot of a queen” </p>
            <p class="tutorial-contents"><b>Try: </b>portrait, headshot, ultrawide shot, extreme closeup, macro shot, an expansive view of</p>

            <hr class="solid"></hr>
            <h5 class="tutorial-contents">Too many small details may overwhelm the system:</h5>
            <p class="tutorial-contents"><b>Avoid: </b>“a monkey on roller skates juggling razor blades in a hurricane” </p>
            <p class="tutorial-contents"><b>Try: </b>“a monkey that’s a hurricane of chaos”</p>

            <hr class="solid"></hr>
            <h5 class="tutorial-contents">Try to use singular nouns or specific numbers</h5>
            <p class="tutorial-contents">Vague plural words leave a lot to chance (did you mean 2 wizards or 12 wizards?)</p>
            <p class="tutorial-contents"><b>Avoid: </b>“cyberpunk wizards”</p>
            <p class="tutorial-contents"><b>Try: </b>“three cyberpunk wizards”</p>
            <br/>
            <p class="tutorial-contents"><b>Avoid: </b>“psychedelic astronauts”</p>
            <p class="tutorial-contents"><b>Try: </b>“psychedelic astronaut crew” (implies a crew shot)</p>

            <hr class="solid"></hr>
            <h5 class="tutorial-contents">Avoid concepts which involve significant extrapolation</h5>
            <p class="tutorial-contents"><b>Avoid: </b>“an optimistic vision of an augmented reality future” </p>
            <p class="tutorial-contents"><b>Try: </b>“a solarpunk city filled with holograms”</p>
            <br/>
            <p class="tutorial-contents"><b>Avoid: </b>“Clothes humans will wear 12,000 years into the future”</p>
            <p class="tutorial-contents"><b>Try: </b>“wildly futuristic clothing with glowing and colorful decoration”</p>
            <hr class="solid"></hr>

            <br/>
            <br/>
            <button type="button" class="btn btn-secondary" onClick={() => setOpenModal(false)}>Close</button>
            <br/>
            <br/>
        </div>
    </div>
  )
}

export default TutorialModal;
