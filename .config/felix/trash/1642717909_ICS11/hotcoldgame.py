## Name of Program: Hot/Cold Game
## Date: 04/27/21
## Author: Ashwin Gnanam (Using the provided instructions)
## Brief Description of Program: The computer will choose a number from 1 to 10 and you will have to guess what it chose.

import random

print ("""
Welcome to the Guessing Game!
The computer will choose a number from 1 to 10 and you will have to guess what it chose.
""")

number = random.randint(1,100)

playing = True

while playing == True:
    guess = int(input("Guess what number the computer chose? "))
    guessDifference = abs(guess - number)

    if guess == number:
        print ("You guessed correctly")
        playing = False
    elif guessDifference <= 5:
        print ("Hot")
    elif guessDifference <= 10:
        print ("Warm")
    elif guessDifference <= 20:
        print ("cool")
    elif guessDifference <= 30:
        print ("Cold")