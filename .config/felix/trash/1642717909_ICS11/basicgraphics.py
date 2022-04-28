# Name of Program: Drawing Excercise 1
# Date: 04/27/21
# Author: Ashwin Gnanam
# Brief Description of Program: This program draws different shapes to the screen.

# importing libraries and initializing pygame
import pygame
import sys
pygame.init()

# creating a window to draw shapes on
size = (800,600)
screen = pygame.display.set_mode(size)

# defining basic colours
WHITE = (255,255,255)
BLACK = (0,0,0)
RED = (255,0,0)
GREEN = (0,255,0)	
BLUE = (0,0,255)

# making the display white and updating so that it is visible
screen.fill(WHITE)
pygame.display.update()

# drawing a circle and updating the screen so that it is visible
pygame.draw.circle(screen,GREEN, (250,100), 50, 0)
pygame.display.update()

# green circle, at x = 550, y = 100, colour = GREEN, radius = 50, thickness = 0
pygame.draw.circle(screen,GREEN, (550,100), 50, 0)
pygame.display.update()

# red rectangle at x = 375, y = 200, width = 50, height = 125, thickness = 0
pygame.draw.rect(screen,RED,(375,200,50,125), 0)
pygame.display.update()

# blue arc x = 250, y = 400, width = 300, height = 100 start_angle = 3, stop_angle = 6.35, 	thickness = 5
pygame.draw.arc(screen, BLUE, (250, 400, 300, 100), 3, 6.35, 5)
pygame.display.update()

# creating a while loop so we can stop the program
go = True
while go:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            go = False

# quitting the program
pygame.quit()
sys.exit()