# import the necessary modules
import pygame
import sys
 
#initialize pygame
pygame.init()
 
# setting the size for the window
screen = pygame.display.set_mode((800,600),0)
# set the caption for the screen
pygame.display.set_caption("paddles")

# saving the width and height of the window in a variable so that we can use this later
screenWidth = screen.get_width()
screenHeight = screen.get_height()
 
# defining colours that will be used
WHITE = (255,255,255)
GREEN = (0,255,0)
RED = (255,0,0)
BLUE = (0,0,255)
BLACK = (0,0,0)
YELLOW = (255,255,0)
 
#initialize variables for player1
x = 400
y = 300
width = 20
height = 70
dx = 0
dy = 0
speed = 3
colour = RED

#initialize variables for player2
x1 = 400
y1 = 300
width1 = 20
height1 = 70
dx1 = 0
dy1 = 0
speed1 = 3
colour1 = BLUE

clock = pygame.time.Clock()
FPS = 144 # set the frames per second 

# set main loop to True so it will run
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

    clock.tick(FPS) # constrain this loop to the specified FPS                      
    screen.fill(YELLOW)

    # storing old x and y values so that we can move player1 back to their location if it leaves the screen boundaries
    oldx = x
    oldy = y

    # storing old x1 and y1 values so that we can move player2 back to their location if it leaves the screen boundaries
    oldx1 = x1
    oldy1 = y1

    # move the x and y positions of player1
    x = x + dx
    y = y + dy

    # move the x and y positions of player2
    x1 = x1 + dx1
    y1 = y1 + dy1

    # stopping player1 from leaving the screen boundaries
    if x > screenWidth - width:
      x = oldx
      y = oldy

    if x < 0:
      x = oldx
      y = oldy

    if y > screenHeight - height:
      x = oldx
      y = oldy 

    if y < 0:
      x = oldx
      y = oldy

    # stopping player2 from leaving the screen boundaries
    if x1 > screenWidth - width1:
      x1 = oldx1
      y1 = oldy1

    if x1 < 0:
      x1 = oldx1
      y1 = oldy1

    if y1 > screenHeight - height1:
      x1 = oldx1
      y1 = oldy1

    if y1 < 0:
      x1 = oldx1
      y1 = oldy1

    # drawing the paddles
    pygame.draw.rect(screen, colour,(0, y, width, height),0)
    pygame.draw.rect(screen, colour1,(780, y1, width1, height1),0)
    pygame.display.flip()
    
# quit pygame and exit the program
pygame.quit()
sys.exit()
