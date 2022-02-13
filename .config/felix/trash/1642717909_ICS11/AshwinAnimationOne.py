# Random Colour Changing Bouncing Balls
# Ashwin
# May 6th, 2021
# This program makes three balls bounce continuosly and change to a random colour every time they hit a wall
 
#imports
import pygame
import sys
from random import randint
 
#initialize pygame
pygame.init()
 
# make surface to draw on
screenSize = (800,600)
screen = pygame.display.set_mode(screenSize)
pygame.display.set_caption("Colour Changing Bouncing Balls")  # puts a caption on the top of the surface
 
# get screen width and height
screenWidth = screen.get_width()
screenHeight = screen.get_height()
 
# declare colours
WHITE = (255,255,255)
 
#fill screen with a colour
screen.fill(WHITE)
pygame.display.update()

# variables for ball
x = 100
y = 200
dx = 2
dy = 2
r = 25
colour = (randint(0,255), randint(0,255), randint(0,255))   # set a random starting colour

# variables for ball2
x1 = 450
y1 = 400
dx1 = 2
dy1 = 2
r1 = 40
colour1 = (randint(0,255), randint(0,255), randint(0,255))   # set a random starting colour

# variables for ball3
x2 = 300
y2 = 300
dx2 = 2
dy2 = 2
r2 = 60
colour2 = (randint(0,255), randint(0,255), randint(0,255))   # set a random starting colour

clock = pygame.time.Clock()
FPS = 75   # set the frames per second 
 
# main loop
main = True
while main:
    # get events,  check for the quit button being clicked
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            main = False
    
    """
    BALL ONE~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    """

    # setting the speed of the animation & clearing the screen
    clock.tick(FPS) # constrain this loop to the specified FPS
    screen.fill(WHITE) # clear the screen
 
    # change x direction if ball hits right wall and change to a random colour
    if x> screenWidth - r:
        dx = -dx
        colour = (randint(0,255), randint(0,255), randint(0,255))
    
    # change x direction if ball hits left wall and change to a random colour
    if x<r:
        dx = -dx
        colour = (randint(0,255), randint(0,255), randint(0,255))
 
    # change direction if ball hits top wall and change to a random colour
    if y < r:
        dy = -dy
        colour = (randint(0,255), randint(0,255), randint(0,255))
    
    # change direction if ball hits bottom wall and change to a random colour
    if y> screenHeight -r:
        dy = -dy
        colour = (randint(0,255), randint(0,255), randint(0,255))
 
    x = x - dx
    y = y - dy

    """
    BALL TWO~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    """

    # setting the speed of the animation & clearing the screen
    clock.tick(FPS) # constrain this loop to the specified FPS
    screen.fill(WHITE) # clear the screen
 
    # change x direction if ball2 hits right wall and change to a random colour
    if x1> screenWidth - r1:
        dx1 = -dx1
        colour1 = (randint(0,255), randint(0,255), randint(0,255))
    
    # change x direction if ball2 hits left wall and change to a random colour
    if x1<r1:
        dx1 = -dx1
        colour1 = (randint(0,255), randint(0,255), randint(0,255))
 
    # change direction if ball2 hits top wall and change to a random colour
    if y1 < r1:
        dy1 = -dy1
        colour1 = (randint(0,255), randint(0,255), randint(0,255))
    
    # change direction if ball2 hits bottom wall and change to a random colour
    if y1> screenHeight -r1:
        dy1 = -dy1
        colour1 = (randint(0,255), randint(0,255), randint(0,255))
 
    x1 = x1 + dx1
    y1 = y1 + dy1

    """
    BALL THREE~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    """

    # setting the speed of the animation & clearing the screen
    clock.tick(FPS) # constrain this loop to the specified FPS
    screen.fill(WHITE) # clear the screen
 
    # change x direction if ball3 hits right wall and change to a random colour
    if x2> screenWidth - r2:
        dx2 = -dx2
        colour2 = (randint(0,255), randint(0,255), randint(0,255))
    
    # change x direction if ball3 hits left wall and change to a random colour
    if x2<r2:
        dx2 = -dx2
        colour2 = (randint(0,255), randint(0,255), randint(0,255))
 
    # change direction if ball3 hits top wall and change to a random colour
    if y2 < r2:
        dy2 = -dy2
        colour2 = (randint(0,255), randint(0,255), randint(0,255))
    
    # change direction if ball3 hits bottom wall and change to a random colour
    if y2> screenHeight -r2:
        dy2 = -dy2
        colour2 = (randint(0,255), randint(0,255), randint(0,255))
 
    x2 = x2 - dx2
    y2 = y2 + dy2

    # drawing all the circles and updating the display
    pygame.draw.circle (screen, colour, (x,y),r, 0)
    pygame.draw.circle (screen, colour1, (x1,y1),r1, 0)
    pygame.draw.circle (screen, colour2, (x2,y2),r2, 0)
    pygame.display.update()

pygame.quit()
sys.exit()