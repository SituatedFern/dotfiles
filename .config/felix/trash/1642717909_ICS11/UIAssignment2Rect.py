# Paddles Using Rect
# Ashwin Gnanam
# May 11th, 2021
# This program displays pong paddles using rects (basic UI assignment 2)

# import the necessary modules
import pygame
import sys
 
#initialize pygame
pygame.init()
 
# set the size for the surface (screen)
screenWidth = 800
screenHeight = 600
screen = pygame.display.set_mode((screenWidth,screenHeight),0)
pygame.display.set_caption("Paddles With Rects")  # setting the name of the pygame window
 
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

clock = pygame.time.Clock()
FPS = 144 # set the frames per second 

#creating a Rect to hold the player
playerRect = pygame.Rect(startX,startY,width,height)
playerRect1 = pygame.Rect(startX1,startY1,width1,height1)
 
# setting main loop to True so it will run
main = True
# main loop
while main:
    for event in pygame.event.get(): # check for any events
        if event.type ==pygame.QUIT:
            main = False # set the "main" variable to False to exit while loop
        if event.type ==pygame.KEYDOWN:
            if event.key == pygame.K_w:
                dx = 0
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

    # drawing the player, in this case a blue rectangle
    pygame.draw.rect(screen, BLUE,playerRect,0)
    pygame.draw.rect(screen, RED,playerRect1,0)
    pygame.display.flip()

    # setting the game speed
    clock.tick(FPS)
    screen.fill(YELLOW)
    
# quit pygame and exit the program (i.e. close everything down)
pygame.quit()
sys.exit()
