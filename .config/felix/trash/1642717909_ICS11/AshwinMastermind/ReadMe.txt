This folder contains all the nessesary dependencies for my mastermind game.
final.py is a text based version of mastermind (the user inputs numbers from 1-5 instead of balls).
The main program is called AshwinMastermind.py
When you first run AshwinMastermind.py, you have 3 options. You can play the game, view the instructions, or quit the program.
The instructions will give you a brief explanation of how to play the game.
Once you click play, you will be prompted to select one of the three difficulty levels. Easy gives you ten tries and prompts you on what you got wrong. Hard is the same as easy except you only get 5 tries.
Impossible difficulty is by far the hardest, because you only get 5 tries and you will not get any propts on what you got wrong.
After selecting a difficulty level, you will see the cheats menu. If you wish to play the game without cheats, set both of the cheats to "OFF" and simply click play or select "Cheats Off". 
If you wish to play with cheats, you can set the cheat you want by clicking "ON" and then select play. You can choose between terminal cheats and on screen cheats.
After selecting your cheat options, you will enter the game screen. You will see a 4x5 grid of slots and 5 coloured balls below. 
Your goal is to guess what sequence of balls will fit in the correct order. You will submit your guess by placing the balls in the top row of slots (in whatever order you want).
Your previous guesses are depicted in the slots below. If you are on Easy mode, you can view your previous 5 guesses once you have filled all 5 rows. If not, the game will end
once you have failed 5 times.
If you use the on screen cheats mode, you will see a bracketed list (ex. Target: [1,5,4,2]). Each number of the list corresponds to a ball:

RED = 1
GREEN = 2
WHITE = 3
YELLOW = 4
BLUE = 5

The list shows the order of the balls (in the correct order). In this case (Target: [1,5,4,2]), the order would be RED, BLUE, YELLOW, GREEN. The same is true for the target section of 
the terminal cheats.
Once you have completed the game (lost or won), you can press "play again" to restart the program, or "quit" to end the program.