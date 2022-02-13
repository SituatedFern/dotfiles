# Bouncing Smile
# Ashwin Gnanam
# May 25th, 2021
# This program makes a happy face bounce continuosly
 
#imports
import pygame
import sys
import math
import random
 
#initialize pygame
pygame.init()
 
# make surface to draw on
screenSize = (800,600)
screen = pygame.display.set_mode(screenSize)
pygame.display.set_caption("Bouncing Smile")  # puts a caption on the top of the surface
 
# get screen width and height
screenWidth = screen.get_width()
screenHeight = screen.get_height()

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
dx = 2
dy = 2
r = random.randint(25,150)
x = random.randint(0+r*2,800-r*2)
y = random.randint(0+r*2,600-r*2)
colour = GREEN   # set the starting colour

clock = pygame.time.Clock()
FPS = 144   # set the frames per second 
 
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
 
    drawHappy(x,y,r,RED)
    pygame.display.flip()
 
pygame.quit()
sys.exit()
