# URL
https://piction-ai-ry.fly.dev/

# Overview
Piction.AI.ry is a two-player drawing/guessing game which utilizes the Stable Diffusion text-to-image AI model to generate user “drawings.” Much like old-school drawing/guessing games, players will take turns acting as the “Drawing-Player” or “Guessing-Player,” and must work together to communicate each round’s word using only AI-generated images based on text queries.

# How to play Piction.AI.ry
At the start of each round, each player will randomly be designated either the round’s Drawing-Player or Guessing-Player. The role of a player can be found near the top of their playing screen.

The Drawing-Player will be provided with the round’s keyword, and a textbox that can be used to query the AI

The Drawing-Player will have 60 seconds to submit prompts to the AI, being careful not to include the actual word itself.

**Example keyword:** "Veterinarian"

**Example query:** "A smiling person in a while lab coat holding a small dog."

The AI will generate 4 image options and display them to the Drawing-Player only. The Drawing-Player can select the one image that most embodies that round’s keyword and have that image sent to the Guessing-Player, or they can submit a new query to the AI image generator to create 4 new image options. There is no limit to the number of images that may be sent during a round.
NOTE: The Guessing-Player will not be shown an image until the Drawing-Player selects and confirms that image (i.e. they will not be shown the querying terms, nor the 4 returned image options).

At any time during the Drawing-Player’s turn, they can undo/redo their previously sent images by clicking the Undo/Redo buttons, or can choose to pass their turn.

The round is over when either the Guessing-Player correctly guesses the word, the Drawing-Player chooses to pass their turn, or the timer runs out. When a round is over, the players will then switch roles and a new round will begin.

The game is over when all 10 rounds are completed. At that time, users will be shown the percentage of words successfully guessed during that game–can you manage to get 100%?

# How to write stronger Piction.AI.ry prompts
(credit: https://docs.midjourney.com/docs/explore-prompting)

### Anything left unsaid may surprise you ###

You can be as specific or as vague as you want, but anything you leave out will be randomized. Being vague is a great way to get variety, but you may not get what you’re looking for. 

Try to be clear about any context or details that are important to you.

---
### Try visually well-defined objects *(something with a lot of photos on the internet)* ###

**Try:** Wizard, priest, angel, emperor, rockstar, city, queen, Zeus, house, temple, farm, car, landscape, mountain, river

---
### Try invoking a particular *medium* ###

If the style is unspecified, it will lean towards photorealism

**Examples:** “a watercolor painting of a landscape” “a child's drawing of a home”

**Try:** painting, drawing, sketch, pencil drawing, woodblock print, matte painting, child's drawing, charcoal drawing, an ink drawing, oil on canvas, graffiti, watercolor painting, fresco, stone tablet, cave painting, sculpture, work on paper, needlepoint

---
### Speak in positives. Avoid negatives. ###

Language models often ignore negative words (“not” “but” “except” “without”).

**Avoid:** “a hat that's not blue”

**Try:** “a blue hat”

---
### Specify what you want clearly ###

**Avoid:** “monkeys doing business”

**Try:** “three monkeys in business suits”

---
### If you want a specific composition, say so! ###

**Examples:** “a portrait of a queen” “an ultrawide shot of a queen”

**Try:** “portrait, headshot, ultrawide shot, extreme closeup, macro shot, an expansive view of”

---
### Too many small details may overwhelm the system ###

**Avoid:** “a monkey on roller skates juggling razor blades in a hurricane”

**Try:** “a monkey that’s a hurricane of chaos”

---
### Try to use singular nouns or specific numbers ###
Vague plural words leave a lot to chance (did you mean 3 wizards or 12 wizards?)

**Avoid:** “cyberpunk wizards”

**Try:** “three cyberpunk wizards”

---
### Avoid concepts which involve significant extrapolation ###

**Avoid:** “Clothes humans will wear 12,000 years into the future”

**Try:** “wildly futuristic clothing with glowing and colorful decoration”