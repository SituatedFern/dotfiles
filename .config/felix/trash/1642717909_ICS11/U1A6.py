# Colour Changing Bouncing Ball
# Ashwin
# May 5th, 2021
# This program makes a ball bounce continuosly and change colour every time it hits a wall
 
#imports
import pygame
import sys
# import time
 
#initialize pygame
pygame.init()
 
# make surface to draw on
screenSize = (800,600)
screen = pygame.display.set_mode(screenSize)
pygame.display.set_caption("Colour Changing Bouncing Ball")  # puts a caption on the top of the surface
 
# get screen width and height
screenWidth = screen.get_width()
screenHeight = screen.get_height()
 
# declare colours
WHITE = (255,255,255)
GREEN = (0,255,0)
BLUE = (0,0,255)
RED = (255,0,0)
BLACK = (0,0,0)
 
#fill screen with a colour
screen.fill(WHITE)
pygame.display.update()
 
# variables for ball
x = 100
y = 200
dx = 2
dy = 2
r = 25
colour = GREEN   # set the starting colour

clock = pygame.time.Clock()
FPS = 75   # set the frames per second 
 
# main loop
main = True
while main:
    # get events,  check for the quit button being clicked
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            main = False
    
    # time.sleep(0.01)
    clock.tick(FPS) # constrain this loop to the specified FPS
    screen.fill(WHITE) # clear the screen
 
    # change x direction if ball hits right wall
    if x> screenWidth - r:
        dx = -dx
        colour = RED
    
    # change x direction if ball hits left wall
    if x<r:
        dx = -dx
        colour = BLUE
 
    # change direction if ball hits top wall
    if y < r:
        dy = -dy
        colour = GREEN
    
    # change direction if ball hits bottom wall
    if y> screenHeight -r:
        dy = -dy
        colour = BLACK
 
    x = x + dx
    y = y + dy
 
    pygame.draw.circle (screen, colour, (x,y),r, 0)
    pygame.display.update()
 
pygame.quit()
sys.exit()
