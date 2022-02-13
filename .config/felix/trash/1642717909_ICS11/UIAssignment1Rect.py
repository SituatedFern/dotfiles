# Trapped Snake Using Rect
# Ashwin Gnanam
# May 11th, 2021
# This program displays trapped snake using rects (basic UI assignment 1)

# import the necessary modules
import pygame
import sys
 
#initialize pygame
pygame.init()
 
# set the size for the surface (screen)
screenWidth = 800
screenHeight = 600
screen = pygame.display.set_mode((screenWidth,screenHeight),0)
# set the caption for the screen
pygame.display.set_caption("Trapped Snake With Rects")  # setting the name of the pygame window
 
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
 
#initializing variables for player
startX = 400
startY = 300
dx = 0
dy = 0
width = 32
height = 32
speed = 3

screen.fill(YELLOW) # setting the background colour
 
#creating a Rect to hold the player
playerRect = pygame.Rect(startX,startY,width,height)
 
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
        if event.type == pygame.KEYUP:
            if event.key == pygame.K_w or event.key == pygame.K_s:
                dx = 0
                dy = 0
            elif event.key == pygame.K_a or event.key == pygame.K_d:
                dx = 0
                dy = 0
    
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
 
    # drawing the player, in this case a blue rectangle
    pygame.draw.rect(screen, BLUE,playerRect,0)
    pygame.display.flip()

    # setting the game speed
    clock.tick(FPS)
    
# quit pygame and exit the program (i.e. close everything down)
pygame.quit()
sys.exit()
