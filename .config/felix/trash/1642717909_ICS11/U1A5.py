#Basic Animation Exercise 4
# Mr. Holik
# May the 4th be with you
# just a quick program to test drawing in pygame

# imports
import pygame
import sys

# initialize pygame
pygame.init()

#make the screen
size = (800,600)
screen = pygame.display.set_mode(size)
pygame.display.set_caption("Basic Graphics")

# create variables and store screen width and height in them
screenWidth = screen.get_width()
screenHeight = screen.get_height()

# set up colours
WHITE = (255,255,255)
BLACK = (0,0,0)
RED = (255,0,0)
GREEN = (0,255,0)	
BLUE = (0,0,255)

#fill the screen with a colour to start
screen.fill(WHITE)
pygame.display.update()

# variables for our circle
dx = 1
dy = 0
r = 50
x = r
y = screenHeight - r

# main loop
main = True
while main == True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            main = False

    screen.fill(WHITE)

    # the circle will start in the lower left corner
    # and go around the screen counter clockwise continuously
    
    # when circle gets to right side of screen
    if x >= screenWidth -r and dx >0:
        dx = 0
        dy = -1
        
    # when circle gets to the top of the screen
    if y < r and dy < 0:
        dy = 0
        dx = -1

    # when circle gets to the left side of the screen
    if x < r and dx <0:
        dx = 0
        dy = 1

    # when circle gets to bottom of screen (starting position)
    if y > screenHeight -r and dy >0:
        dx = 1
        dy = 0

    
    # code to move circle
    x = x + dx
    y = y + dy
    
    # draw circle and update screen
    pygame.draw.circle(screen, GREEN, (x,y), r, 0)
    pygame.display.update()


# close down the program and pygame
pygame.quit()
sys.exit()