# Paddles Using Rect
# Ashwin Gnanam
# May 17th, 2021
# This program creates a pong game and menu system

# import the necessary modules
import pygame
import sys

#initialize pygame
pygame.init()
 
# set the size for the surface (screen)
screenWidth = 800
screenHeight = 600
screen = pygame.display.set_mode((screenWidth,screenHeight),0)
pygame.display.set_caption("Pong")  # setting the name of the pygame window
 
# define colours you will be using
WHITE = (255,255,255)
GREEN = (0,255,0)
RED = (255,0,0)
BLUE = (0,0,255)
BLACK = (0,0,0)
YELLOW = (255,255,0)

# setting the game clock with 75 frames per second
clock = pygame.time.Clock()
FPS = 75

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
        Title1 = smallfont.render("To play Pong use the W and S key to move player 1.", True, WHITE)
        # create a rect from the text
        Rect1 = Title1.get_rect(center = pygame.display.get_surface().get_rect().center)
        # place this rect at the centre of the screen

        Rect1.center = (screenWidth / 2), (screenHeight / 2)

        Rect1.x = 40
        Rect1.y = int(screenHeight//2)-200

        screen.fill(BLACK)
        screen.blit(Title1, Rect1)

        # render the text into an image of the text, colour is white
        Title2 = smallfont.render("Use the Up and Down key to move player 2.", True, WHITE)
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

def pong():
    #initializing variables for player1
    startX = 0
    startY = 300
    width = 20
    height = 70
    dx = 0
    dy = 0
    speed = 3
    colour = RED

    #initialize variables for player2
    startX1 = 780
    startY1 = 300
    width1 = 20
    height1 = 70
    dx1 = 0
    dy1 = 0
    speed1 = 3
    colour1 = BLUE

    # variables for ball
    directionx = 2
    directiony = 2
    r = 10
    ballcolour = YELLOW
    p1counter = 0
    p2counter = 0

    by = screenHeight//2
    bx = screenWidth//2

    fontTitle = pygame.font.SysFont("arial",50)

    #creating a Rect to hold the player
    playerRect = pygame.Rect(startX,startY,width,height)
    playerRect1 = pygame.Rect(startX1,startY1,width1,height1)
    ballRect = pygame.Rect(bx,by,r*2,r*2)
    
    # setting main loop to True so it will run
    main = True
    # main loop
    while main:
        for event in pygame.event.get(): # check for any events
            if event.type ==pygame.QUIT:
                main = False # set the "main" variable to False to exit while loop
            if event.type ==pygame.KEYDOWN:
                if event.key == pygame.K_w:
                    dy = -speed
                elif event.key == pygame.K_s:
                    dx = 0
                    dy = speed
                elif event.key == pygame.K_UP:
                    dx1 = 0
                    dy1 = -speed1
                elif event.key == pygame.K_DOWN:
                    dx1 = 0
                    dy1 = speed1
                elif event.key == pygame.K_ESCAPE:
                    menu()
                elif event.key == pygame.K_q:
                    pygame.quit()
                    sys.exit()
            if event.type == pygame.KEYUP:
                if event.key == pygame.K_w or event.key == pygame.K_s:
                    dx = 0
                    dy = 0
                elif event.key == pygame.K_UP or event.key == pygame.K_DOWN:
                    dx1 = 0
                    dy1 = 0
        
        # storing old x and y values so that we can move player1 back to their location if it leaves the screen boundaries
        oldx = playerRect.x
        oldy = playerRect.y

        # storing old x and y values so that we can move player2 back to their location if it leaves the screen boundaries
        oldx1 = playerRect1.x
        oldy1 = playerRect1.y
        # code to move player1's x and y position
        playerRect.x = playerRect.x + dx
        playerRect.y = playerRect.y + dy

        # code to move player2's x and y position
        playerRect1.x = playerRect1.x + dx1
        playerRect1.y = playerRect1.y + dy1

        # stopping player1 from going outside the window (teleporting it to its last location inside the window)
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

        # stopping player2 from going outside the window (teleporting it to its last location inside the window)
        if playerRect1.x > screenWidth - width1:
            playerRect1.x = oldx1
            playerRect1.y = oldy1

        if playerRect1.x < 0:
            playerRect1.x = oldx1
            playerRect1.y = oldy1

        if playerRect1.y > screenHeight - height1:
            playerRect1.x = oldx1
            playerRect1.y = oldy1 

        if playerRect1.y < 0:
            playerRect1.x = oldx1
            playerRect1.y = oldy1

        # change x direction if ball hits right wall
        if ballRect.x > screenWidth - r*2:
            directionx = -directionx
            p2counter += 1
            print ("p2's score", p2counter)
            ballRect.x = screenWidth//2
            ballRect.y = screenHeight//2

        
        # change x direction if ball hits left wall
        if ballRect.x < r:
            directionx = -directionx
            p1counter += 1
            print ("p1's score:", p1counter)
            ballRect.x = screenWidth//2
            ballRect.y = screenHeight//2
    
        # change direction if ball hits top wall
        if ballRect.y < r:
            directiony = -directiony
        
        # change direction if ball hits bottom wall
        if ballRect.y > screenHeight - r*2:
            directiony = -directiony

        ballRect.x = ballRect.x + directionx
        ballRect.y = ballRect.y + directiony


        if playerRect.colliderect(ballRect):
            directionx = -directionx

        if playerRect1.colliderect(ballRect):
            directionx = -directionx

        # score for player 1
        msg = "{0}".format(p2counter)
        textTitle = fontTitle.render(msg, True, WHITE)
        textRect = textTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
        textRect.x = 150
        textRect.y = 100

        # score for player 2
        msg = "{0}".format(p1counter)
        textTitle1 = fontTitle.render(msg, True, WHITE)
        textRect1 = textTitle1.get_rect(center = pygame.display.get_surface().get_rect().center)
        textRect1.x = screenWidth - 150
        textRect1.y = 100

        # drawing the players, the ball, and the score
        clock.tick(FPS) # setting the game speed
        screen.fill(BLACK)
        screen.blit(textTitle, textRect)
        screen.blit(textTitle1, textRect1)
        pygame.draw.rect(screen, colour1,playerRect,0)
        pygame.draw.rect(screen, colour,playerRect1,0)
        #pygame.draw.circle(screen, ballcolour, (ballx,bally),r, 0)
        pygame.draw.circle(screen, ballcolour, ballRect.center, r)
        pygame.display.flip()

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
            pong()

        elif(quitRect.collidepoint(pygame.mouse.get_pos()) and pygame.mouse.get_pressed()[0]):
            pygame.quit()
            sys.exit()
            
        elif(helpRect.collidepoint(pygame.mouse.get_pos()) and pygame.mouse.get_pressed()[0]):
            inst()
menu()

# quit pygame and exit the program (i.e. close everything down)
pygame.quit()
sys.exit()