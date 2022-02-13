# Moving Smile
# Ashwin Gnanam
# May 25th, 2021
# This program makes a happy face that the user can move with WASD. The ball will not leave the screen.


# import the necessary modules
import pygame
import sys
import math
import random

# initialize pygame
pygame.init()

# set the size for the surface (screen)
# note this screen is resizable by the user
screen = pygame.display.set_mode((800, 600), pygame.RESIZABLE)
# set the caption for the screen
pygame.display.set_caption("Happy Face")

#screen width and height
screenW = screen.get_width()
screenH = screen.get_height()

randr = random.randint(25,150)
width = randr*2
height = randr*2
startX = random.randint(0+width,800-width)
startY = random.randint(0+height,600-height)
dx = 0
dy = 0
speed = 3

# funtion to draw a the "happy face"
# it has 4 parameters passed to it xPos, yPos, radius, and colour
# notice all the shapes are drawn "relative" to the xPos and yPos and the radius

def drawHappy(xPos,yPos,r,colour):
    pygame.draw.circle(screen,colour,(xPos,yPos),r,1)
    eyeRadius = int(1/6*r)
    eyeX = int(xPos-1/3*r)
    eyeY = int(yPos- 1/3*r)
    pygame.draw.circle(screen,colour,(eyeX,eyeY),eyeRadius,1)
    eyeX = int(xPos + 1/3*r)
    pygame.draw.circle(screen,colour,(eyeX,eyeY),eyeRadius,1)
    wMouth = 1.5*r
    xMouth = xPos - 3/4*r
    yMouth = yPos - 3/4*r
    pygame.draw.arc(screen,colour,(xMouth,yMouth,wMouth,wMouth),math.pi,2*math.pi,1)
   
   
# define colours you will be using
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
BLACK = (0, 0, 0)
YELLOW = (255, 255, 0)

ballcolour = RED


# set up clock to control frames per second
clock = pygame.time.Clock()
FPS = 144

ballRect = pygame.Rect(startX,startY,width,height)

# set main loop to True so it will run
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
    oldx = ballRect.x
    oldy = ballRect.y
    # code to move the players x and y position
    ballRect.x = ballRect.x + dx
    ballRect.y = ballRect.y + dy

    # stopping the square from going outside the window (teleporting it to its last location inside the window)
    if ballRect.x > screenW - width:
      ballRect.x = oldx
      ballRect.y = oldy

    if ballRect.x < 0:
      ballRect.x = oldx
      ballRect.y = oldy

    if ballRect.y > screenH - height:
      ballRect.x = oldx
      ballRect.y = oldy 

    if ballRect.y < 0:
      ballRect.x = oldx
      ballRect.y = oldy

    # setting the game speed
    clock.tick(FPS)
    screen.fill(BLUE)

    # "call" the function "drawHappy()" to draw the happy face
    # this is where we would normally do a pygame.draw or a screen.blit()
    # we are "passing" the function 4 values to use(x,y,radius, colour)
    # it will use these to know where to draw the happy face

    drawHappy(ballRect.centerx,ballRect.centery,randr,RED)
    pygame.display.flip()
    
# quit pygame and exit the program (i.e. close everything down)
pygame.quit()
sys.exit()