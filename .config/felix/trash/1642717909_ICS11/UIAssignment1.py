import pygame
import sys

pygame.init()

screen = pygame.display.set_mode ((800,600), 0)
pygame.display.set_caption("wasd square") # setting the name of the pygame window

# saving the width and height of the window in a variable so that we can use this later
screenWidth = screen.get_width()
screenHeight = screen.get_height()

# adding some colour presets
WHITE = (255,255,255)
GREEN = (0,255,0)
RED = (255,0,0)
BLUE = (0,0,255)
BLACK = (0,0,0)
YELLOW = (255,255,0)

# setting the game clock with 75 frames per second
clock = pygame.time.Clock()
FPS = 75

x = 400 
y = 300 
width = 32
height = 32
dx = 0
dy = 0
speed = 3

screen.fill(YELLOW) # setting the background colour
main = True
while main:
    for event in pygame.event.get():
        if event.type ==pygame.QUIT:
            main = False
        if event.type ==pygame.KEYDOWN:
            if event.key == pygame.K_w:
                dx = 0
                dy = -speed
            elif event.key == pygame. K_s: 
                dx = 0
                dy = speed
            elif event.key == pygame. K_a:
                dx = -speed
                dy = 0 
            elif event.key == pygame. K_d:
                dx = speed
                dy = 0
            elif event.key == pygame.K_q:
                pygame.quit()
                sys.exit()
    if event.type ==pygame.KEYUP:
          if event.key == pygame.K_w or event.key == pygame.K_s:
               dx = 0
               dy = 0
          elif event.key == pygame. K_a or event.key == pygame.K_d: 
               dx = 0
               dy = 0

    # creating variables to store the last position of the square
    oldx = x
    oldy = y

    # moving the square
    x = x + dx
    y = y + dy

    # stopping the square from going outside the window (teleporting it to it's last location inside the window)
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

    # drawing the square
    pygame.draw.rect(screen, BLUE,(x,y,width, height) ,0)
    pygame.display.flip()
    
    # setting the game speed
    clock.tick(FPS)

pygame.quit() 
sys.exit() 