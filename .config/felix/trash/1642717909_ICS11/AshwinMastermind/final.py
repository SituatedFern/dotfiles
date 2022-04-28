import random
import sys

choices = [1,2,3,4,5]
balls = random.sample(choices, 4)
random.shuffle(balls)

def checkisgreater(user,number):
    if user > number:
        print ("Please enter a number lesser than 5.")
        return False
    else:
        return True

def main():
    global attempts
    attempts = 0
main()


def run():
    global attempts
    correctguesses = 0
    correctpos = 0

    guess1 = int(input("First Guess? "))
    checkisgreater(guess1, 5)
    guess2 = int(input("Second Guess? "))
    checkisgreater(guess2, 5)
    guess3 = int(input("Third Guess? "))
    checkisgreater(guess3, 5)
    guess4 = int(input("Fourth Guess? "))
    checkisgreater(guess4, 5)

    if guess1 == balls[0]:
        print ("guess1 is correct!")
        correctpos += 1

    if guess1 != balls[0]:
        print ("guess1 is incorrect!")
        if guess1 in balls:
            correctguesses += 1

    if guess2 == balls[1]:
        print ("guess2 is correct!")
        correctpos += 1

    if guess2 != balls[1]:
        print ("guess2 is incorrect!")
        if guess2 in balls:
            correctguesses += 1

    if guess3 == balls[2]:
        print ("guess3 is correct!")
        correctpos += 1

    if guess3 != balls[2]:
        print ("guess3 is incorrect!")
        if guess3 in balls:
            correctguesses += 1

    if guess4 == balls[3]:
        print ("guess4 is correct!")
        correctpos += 1

    if guess4 != balls[3]:
        print ("guess4 is incorrect!")
        if guess4 in balls:
            correctguesses += 1

    print ("You guessed", correctpos, "colours in the right position and", correctguesses, "right colours in the wrong position")

    if correctpos == 4:
        print ("Correct!")

    def tryagain():
        global attempts
        again = input("Try again? (y/n) ")
        if again == "y":
            attempts += 1
            print ("attempts: ",attempts)
            run()
        if again == "n":
            sys.exit()
        if again != "y" or "n":
            print ("please enter 'y' or 'n'")
    tryagain()
run()