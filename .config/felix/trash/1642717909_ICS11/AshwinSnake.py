# Snake
# Ashwin Gnanam
# May 21th, 2021
# This program creates a snake game

# import the necessary modules
import pygame
import random
from time import time
from textwrap import fill
import sys

#initialize pygame
pygame.init()
 
# set the size for the surface (screen)
screenWidth = 800
screenHeight = 600
screen = pygame.display.set_mode((screenWidth,screenHeight),0)
pygame.display.set_caption("Snake")  # setting the name of the pygame window
 
# define colours you will be using
WHITE = (255,255,255)
GREEN = (0,255,0)
RED = (255,0,0)
BLUE = (0,0,255)
OFFBLUE = (1,0,255)
BLACK = (0,0,0)
YELLOW = (255,255,0)

# setting the game clock with 75 frames per second
clock = pygame.time.Clock()
FPS = 75

speed = 2

def inst():
    #creating font presets to use later
    smallfont = pygame.font.SysFont("arial",20)
    fontTitle = pygame.font.SysFont("arial",50)

    main = True
    while main == True:

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                main = False
                pygame.quit()
                sys.exit()

        clock.tick(FPS) # constrain this loop to the specified FPS                      

        # render the text into an image of the text, colour is white
        Title1 = smallfont.render("Use WASD to move the player. Try not to touch your tail!", True, WHITE)
        # create a rect from the text
        Rect1 = Title1.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen

        Rect1.center = (screenWidth / 2), (screenHeight / 2)

        Rect1.x = 40
        Rect1.y = int(screenHeight//2)-200

        screen.fill(BLACK)
        screen.blit(Title1, Rect1)

        # render the text into an image of the text, colour is white
        mystr = "Collect the Apples to increase your score! (time x difficulty + apples = score)"
        Title2 = smallfont.render(mystr, True, WHITE)
        # create a rect from the text
        Rect2 = Title2.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen

        Rect2.center = (screenWidth / 2), (screenHeight / 2)

        Rect2.x = 40
        Rect2.y = int(screenHeight//2)-100

        screen.blit(Title2, Rect2)

        # render the text into an image of the text, colour is white
        Title3 = smallfont.render("Press escape at anytime to return to the menu.", True, WHITE)
        # create a rect from the text
        Rect3 = Title3.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen

        Rect3.center = (screenWidth / 2), (screenHeight / 2)

        Rect3.x = 40
        Rect3.y = int(screenHeight//2)+15

        screen.blit(Title3, Rect3)

        # render the text into an image of the text, colour is red
        backTitle = fontTitle.render("Main Menu", True, YELLOW)
        # create a rect from the text
        backRect = backTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen

        backRect.center = (screenWidth / 2), (screenHeight / 2)

        backRect.x = 40
        backRect.y = int(screenHeight//2)+150

        screen.blit(backTitle, backRect)

        # render the text into an image of the text, colour is red
        qTitle = fontTitle.render("Quit", True, RED)
        # create a rect from the text
        qRect = qTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen

        qRect.center = (screenWidth / 2), (screenHeight / 2)

        qRect.x = 650
        qRect.y = int(screenHeight//2)+150

        screen.blit(qTitle, qRect)

        pygame.display.flip()

        if(backRect.collidepoint(pygame.mouse.get_pos()) and pygame.mouse.get_pressed()[0]):
            menu()
        elif(qRect.collidepoint(pygame.mouse.get_pos()) and pygame.mouse.get_pressed()[0]):
            pygame.quit()
            sys.exit()


def end():
    #creating font presets to use later
    smallfont = pygame.font.SysFont("arial",20)
    bittyfont = pygame.font.SysFont("arial",30)
    fontTitle = pygame.font.SysFont("arial",50)

    main = True
    while main == True:

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                main = False
                pygame.quit()
                sys.exit()

        clock.tick(FPS) # constrain this loop to the specified FPS
        screen.fill(BLACK)

        # render the text into an image of the text, colour is red
        endTitle = fontTitle.render("Game Over", True, RED)
        # create a rect from the text
        endRect = endTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen
        
        endRect.center = (screenWidth / 2), (screenHeight / 2)

        endRect.x = int(screenWidth//2)-150
        endRect.y = int(screenHeight//2)-280

        screen.blit(endTitle, endRect)

        # render the text into an image of the text, colour is red
        scoreYlevel = int(screenHeight//2)-180
        scorecolour = WHITE
        if pscore > 0:
            scorecolour = YELLOW
        elif pscore > 5:
            scorecolour = GREEN
        elif pscore <= 0:
            scorecolour = RED
        scoreTitle = bittyfont.render("Apples Eaten:", True, WHITE)
        # create a rect from the text
        scoreRect = scoreTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen
        
        scoreRect.center = (screenWidth / 2), (screenHeight / 2)

        scoreRect.x = 80
        scoreRect.y = scoreYlevel

        screen.blit(scoreTitle, scoreRect)

        score = "{0}".format(pscore)
        score1Title = bittyfont.render(score, True, scorecolour)
        score1Rect = score1Title.get_rect(center = pygame.display.get_surface().get_rect().center)
        score1Rect.x = 280
        score1Rect.y = scoreYlevel

        screen.blit(score1Title, score1Rect)

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        diffYlevel = int(screenHeight//2)-100
        diffcolour = WHITE

        if difficulty == "Easy":
            xpmultiplier = 10
            diffcolour = GREEN
            
        elif difficulty == "Medium":
            xpmultiplier = 100
            diffcolour = YELLOW

        elif difficulty == "Hard":
            xpmultiplier = 1000
            diffcolour = RED

        diffTitle = bittyfont.render("Difficulty:", True, WHITE)
        # create a rect from the text
        diffRect = diffTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen
        
        diffRect.center = (screenWidth / 2), (screenHeight / 2)

        diffRect.x = 80
        diffRect.y = diffYlevel

        screen.blit(diffTitle, diffRect)

        diff1 = "{0}".format(difficulty)
        diff1Title = bittyfont.render(diff1, True, diffcolour)
        diff1Rect = diff1Title.get_rect(center = pygame.display.get_surface().get_rect().center)
        diff1Rect.x = 215
        diff1Rect.y = diffYlevel

        screen.blit(diff1Title, diff1Rect)

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        timeYlevel = int(screenHeight//2)-20
        timeTitle = bittyfont.render("Time:", True, WHITE)
        # create a rect from the text
        timeRect = timeTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen
        
        timeRect.center = (screenWidth / 2), (screenHeight / 2)

        timeRect.x = 80
        timeRect.y = timeYlevel

        screen.blit(timeTitle, timeRect)

        time1 = "{:.2f}s".format(elapsed)
        time1Title = bittyfont.render(time1, True, WHITE)
        time1Rect = time1Title.get_rect(center = pygame.display.get_surface().get_rect().center)
        time1Rect.x = 165
        time1Rect.y = timeYlevel

        screen.blit(time1Title, time1Rect)

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        xpYlevel = int(screenHeight//2)+60
        xpTitle = bittyfont.render("Score:", True, WHITE)
        # create a rect from the text
        xpRect = xpTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen
        
        xpRect.center = (screenWidth / 2), (screenHeight / 2)

        xpRect.x = 80
        xpRect.y = xpYlevel

        screen.blit(xpTitle, xpRect)

        xp1 = "{:.0f}".format((elapsed*xpmultiplier)+bonus)
        xp1Title = bittyfont.render(xp1, True, GREEN)
        xp1Rect = xp1Title.get_rect(center = pygame.display.get_surface().get_rect().center)
        xp1Rect.x = 180
        xp1Rect.y = xpYlevel

        screen.blit(xp1Title, xp1Rect)

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        clicky = int(screenHeight//2)+200
        # render the text into an image of the text, colour is red
        backTitle = smallfont.render("Play Again", True, YELLOW)
        # create a rect from the text
        backRect = backTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen

        backRect.center = (screenWidth / 2), (screenHeight / 2)

        backRect.x = 80
        backRect.y = clicky

        screen.blit(backTitle, backRect)

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        # render the text into an image of the text, colour is red
        qTitle = smallfont.render("Quit", True, RED)
        # create a rect from the text
        qRect = qTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen

        qRect.center = (screenWidth / 2), (screenHeight / 2)

        qRect.x = 650
        qRect.y = clicky

        screen.blit(qTitle, qRect)

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        pygame.display.flip()

        if(backRect.collidepoint(pygame.mouse.get_pos()) and pygame.mouse.get_pressed()[0]):
            diffselect()
        elif(qRect.collidepoint(pygame.mouse.get_pos()) and pygame.mouse.get_pressed()[0]):
            pygame.quit()
            sys.exit()

def snake():
    global pscore, elapsed, bonus
    startX = 400
    startY = 300
    dx = 0
    dy = 0
    width = 25
    height = 25

    colour = (0,0,0)
    spawncolour = (0,0,0)

    pscore = 0
    bonus = 0

    appleWidth = 10
    appleHeight = 10

    pointfont = pygame.font.SysFont("arial",35)

    screen.fill(WHITE) # setting the background colour
    
    #creating a Rect to hold the player
    playerRect = pygame.Rect(startX,startY,width,height)
    appleRect = pygame.Rect(random.randint(100,400),random.randint(100,400),appleWidth,appleHeight)
    mainRect = pygame.Rect(5,5,(screenWidth-10),(screenHeight-10))
    pygame.draw.rect(screen, YELLOW, mainRect, 0)

    game_start_time = time()
    
    # setting main loop to True so it will run
    main = True
    # main loop
    while main:
        for event in pygame.event.get(): 
            if event.type ==pygame.QUIT: 
                main = False 
            if event.type ==pygame.KEYDOWN:
                if event.key == pygame.K_w:
                    dx = 0
                    dy = -speed
                elif event.key == pygame.K_s:
                    dx = 0
                    dy = speed
                elif event.key == pygame.K_a:
                    dx = -speed
                    dy = 0
                elif event.key == pygame.K_d:
                    dx = speed
                    dy = 0
                elif event.key == pygame.K_ESCAPE:
                    menu()
                elif event.key == pygame.K_q:
                    pygame.quit()
                    sys.exit()
        
        # creating variables to store the last position of the square
        oldx = playerRect.x
        oldy = playerRect.y
        # code to move the players x and y position
        playerRect.x = playerRect.x + dx
        playerRect.y = playerRect.y + dy

        # stopping the square from going outside the window (teleporting it to its last location inside the window)
        if playerRect.x > screenWidth - width:
            playerRect.x = oldx
            playerRect.y = oldy

        if playerRect.x < 0:
            playerRect.x = oldx
            playerRect.y = oldy

        if playerRect.y > screenHeight - height:
            playerRect.x = oldx
            playerRect.y = oldy 

        if playerRect.y < 0:
            playerRect.x = oldx
            playerRect.y = oldy

        if dx > 0:
            (x,y) = playerRect.midright
            colour = screen.get_at((x+1,y))

        if dx < 0:
            (x,y) = playerRect.midleft
            colour = screen.get_at((x-1,y))
        
        if dy > 0:
            (x,y) = playerRect.midbottom
            colour = screen.get_at((x,y+1))

        if dy < 0:
            (x,y) = playerRect.midtop
            colour = screen.get_at((x,y-1))

        if colour == WHITE:
            end()

        blueRect = pygame.draw.rect(screen, GREEN, appleRect)#REMOVE PREV RED RECT
        
        (a,b) = appleRect.midright
        spawncolour = screen.get_at((a,b))
        if spawncolour == BLUE:
            blueRect = pygame.draw.rect(screen, OFFBLUE, appleRect)#REMOVE PREV RED RECT
            appleRect = pygame.Rect(random.randint(100, 400), random.randint(100, 400), 10, 10)
            print ("the apple spawned in the snake")
        (c,d) = appleRect.midleft
        spawncolour = screen.get_at((c,d))
        if spawncolour == BLUE:
            blueRect = pygame.draw.rect(screen, OFFBLUE, appleRect)#REMOVE PREV RED RECT
            appleRect = pygame.Rect(random.randint(100, 400), random.randint(100, 400), 10, 10)
            print ("the apple spawned in the snake")
        (e,f) = appleRect.midtop
        spawncolour = screen.get_at((e,f))
        if spawncolour == BLUE:
            blueRect = pygame.draw.rect(screen, OFFBLUE, appleRect)#REMOVE PREV RED RECT
            appleRect = pygame.Rect(random.randint(100, 400), random.randint(100, 400), 10, 10)
            print ("the apple spawned in the snake")
        (g,h) = appleRect.midbottom
        spawncolour = screen.get_at((g,h))
        if spawncolour == BLUE:
            blueRect = pygame.draw.rect(screen, OFFBLUE, appleRect)#REMOVE PREV RED RECT
            appleRect = pygame.Rect(random.randint(100, 400), random.randint(100, 400), 10, 10)
            print ("the apple spawned in the snake")

        if playerRect.colliderect(appleRect):
            pscore += 1
            bonus += 1000
            print (pscore)
            pygame.draw.rect(screen, YELLOW, appleRect)#REMOVE PREV RED RECT
            pygame.draw.rect(screen, YELLOW, textRect)#REMOVE PREV RED RECT
            appleRect = pygame.Rect(random.randint(100, 400), random.randint(100, 400), 10, 10)

        if colour == BLUE and playerRect.colliderect(blueRect) != True:
            end()

        msg = "{0}".format(pscore)
        textTitle = pointfont.render(msg, True, BLACK)
        textRect = textTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        textRect.x = 50
        textRect.y = 50
    
        # drawing the player, in this case a blue rectangle
        screen.blit(textTitle, textRect)

        pygame.draw.rect(screen, BLUE, playerRect, 0)
        pygame.draw.rect(screen, RED, appleRect, 0)
        pygame.display.flip()

        # setting the game speed
        clock.tick(FPS)

        current_time = time()
        
        elapsed = current_time - game_start_time

def diffselect():
    global speed, difficulty

    fontTitle = pygame.font.SysFont("arial",35)

    main = True
    while main == True:

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                main = False
                pygame.quit()
                sys.exit()

        clock.tick(FPS) # constrain this loop to the specified FPS                      

        # render the text into an image of the text, colour is red
        diffTitle = fontTitle.render("Choose Difficulty:", True, WHITE)
        # create a rect from the text
        diffRect = diffTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen
        
        diffRect.center = (screenWidth / 2), (screenHeight / 2)

        diffRect.x = int(screenWidth//2)-140
        diffRect.y = int(screenHeight//2)-200

        screen.fill(BLACK)
        screen.blit(diffTitle, diffRect)

        # render the text into an image of the text, colour is red
        easyTitle = fontTitle.render("Easy", True, GREEN)
        # create a rect from the text
        easyRect = easyTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen
        
        easyRect.center = (screenWidth / 2), (screenHeight / 2)

        easyRect.x = int(screenWidth//2)-300
        easyRect.y = int(screenHeight//2)-100

        screen.blit(easyTitle, easyRect)

        # render the text into an image of the text, colour is red
        medTitle = fontTitle.render("Medium", True, YELLOW)
        # create a rect from the text
        medRect = medTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen
        medRect.center = (screenWidth / 2), (screenHeight / 2)

        medRect.x = int(screenWidth//2)-300
        medRect.y = int(screenHeight//2)+20

        screen.blit(medTitle, medRect)

        # render the text into an image of the text, colour is red
        hardTitle = fontTitle.render("Hard", True, RED)
        # create a rect from the text
        hardRect = hardTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen
        hardRect.center = (screenWidth / 2), (screenHeight / 2)

        hardRect.x = int(screenWidth//2)-300
        hardRect.y = int(screenHeight//2)+150

        screen.blit(hardTitle, hardRect)

        pygame.display.flip()

        if(easyRect.collidepoint(pygame.mouse.get_pos()) and pygame.mouse.get_pressed()[0]):
            speed = 2
            difficulty = str("Easy")
            snake()
            
        elif(medRect.collidepoint(pygame.mouse.get_pos()) and pygame.mouse.get_pressed()[0]):
            speed = 3
            difficulty = str("Medium")
            snake()

        elif(hardRect.collidepoint(pygame.mouse.get_pos()) and pygame.mouse.get_pressed()[0]):
            speed = 5
            difficulty = str("Hard")
            snake()

def menu():
    fontTitle = pygame.font.SysFont("arial",50)

    main = True
    while main == True:

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                main = False
                pygame.quit()
                sys.exit()

        clock.tick(FPS) # constrain this loop to the specified FPS                      

        # render the text into an image of the text, colour is red
        pongTitle = fontTitle.render("Play", True, WHITE)
        # create a rect from the text
        pongRect = pongTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen
        
        pongRect.center = (screenWidth / 2), (screenHeight / 2)

        pongRect.x = int(screenWidth//2)-45
        pongRect.y = int(screenHeight//2)-200

        screen.fill(BLACK)
        screen.blit(pongTitle, pongRect)

        # render the text into an image of the text, colour is red
        helpTitle = fontTitle.render("Instructions", True, WHITE)
        # create a rect from the text
        helpRect = helpTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen
        
        helpRect.center = (screenWidth / 2), (screenHeight / 2)

        helpRect.x = int(screenWidth//2)-125
        helpRect.y = int(screenHeight//2)-15

        screen.blit(helpTitle, helpRect)

        # render the text into an image of the text, colour is red
        quitTitle = fontTitle.render("Quit", True, WHITE)
        # create a rect from the text
        quitRect = quitTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen
        quitRect.center = (screenWidth / 2), (screenHeight / 2)

        quitRect.x = int(screenWidth//2)-45
        quitRect.y = int(screenHeight//2)+150

        screen.blit(quitTitle, quitRect)

        pygame.display.flip()

        if(pongRect.collidepoint(pygame.mouse.get_pos()) and pygame.mouse.get_pressed()[0]):
            diffselect()

        elif(quitRect.collidepoint(pygame.mouse.get_pos()) and pygame.mouse.get_pressed()[0]):
            pygame.quit()
            sys.exit()
            
        elif(helpRect.collidepoint(pygame.mouse.get_pos()) and pygame.mouse.get_pressed()[0]):
            inst()
menu()

# quit pygame and exit the program (i.e. close everything down)
pygame.quit()
sys.exit()