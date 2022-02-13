# import the necessary modules
import pygame
import sys
 
#initialize pygame
pygame.init()
 
# set the size for the surface (screen)
screen = pygame.display.set_mode((800,600),0)
# set the caption for the screen
pygame.display.set_caption("wasd ball")
 
# define colours you will be using
WHITE = (255,255,255)
GREEN = (0,255,0)
RED = (255,0,0)
BLUE = (0,0,255)
BLACK = (0,0,0)
YELLOW = (255,255,0)
 
#initialize variables for player
x = 400
y = 300
width = 32
height = 32
dx = 0
dy = 0
speed = 3

clock = pygame.time.Clock()
FPS = 144   # set the frames per second 

# set main loop to True so it will run
main = True
# main loop
while main:
    for event in pygame.event.get(): # check for any events (i.e key press, mouse click etc.)
        if event.type ==pygame.QUIT: # check to see if it was "x" at top right of screen
            main = False         # set the "main" variable to False to exit while loop
        if event.type ==pygame.KEYDOWN:
            if event.key == pygame.K_w:
                dx = 0
                dy = -speed
            elif event.key == pygame.K_s:
                dx = 0
                dy = speed
            elif event.key == pygame.K_a:     # note: this section of code
                dx = -speed                     # doesn't have to change from
                dy = 0                           # code not using Rects
            elif event.key == pygame.K_d:
                dx = speed
                dy = 0
            elif event.key == pygame.K_q:
                pygame.quit()
                sys.exit()
        if event.type == pygame.KEYUP:
            if event.key == pygame.K_w or event.key == pygame.K_s:
                dx = 0
                dy = 0
            elif event.key == pygame.K_a or event.key == pygame.K_d:
                dx = 0
                dy = 0

    clock.tick(FPS) # constrain this loop to the specified FPS                      
    screen.fill(YELLOW)
 
    # move the x and y positions of the player
    x = x + dx
    y = y + dy
 
    # draw the player, in this case a blue rectangle
    pygame.draw.rect(screen, BLUE,(x,y,width, height),0)
 
    # we are using .flip() here,  it basically works the same as .update()
    # we will discuss this more in class (you can use either one)
    pygame.display.flip()
    
# quit pygame and exit the program (i.e. close everything down)
pygame.quit()
sys.exit()
