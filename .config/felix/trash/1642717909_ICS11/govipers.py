# Trapped Text Using Rect
# Ashwin Gnanam
# May 12th, 2021
# This program displays the text "go vipers" trapped on the screen. (Basic Text Assignment)

import pygame
import sys

pygame.init()

WHITE = (255,255,255)
GREEN = (0,255,0)
RED = (255,0,0)
BLUE = (0,0,255)

screen = pygame.display.set_mode((800,600),0)
pygame.display.set_caption("Basic Pygame Text With Rects")

screenWidth = screen.get_width()
screenHeight = screen.get_height()

clock = pygame.time.Clock()
FPS = 50 # set the frames per second 
 
screenWidth = screen.get_width()
screenHeight = screen.get_height()

moveUp = False
moveDown = False
moveRight = False
moveLeft = False
center = False

#offsetting the starting position of the rect so that it is centered
xpos = int(screenWidth//2)-100
ypos = int(screenHeight//2)-30

width = 225
height = 60

speed = 5

fontTitle = pygame.font.SysFont("arial",50)

main = True
while main == True:

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            main = False
            pygame.quit()
            sys.exit()
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_w:
                moveUp = True
            if event.key == pygame.K_s:
                moveDown = True
            if event.key == pygame.K_a:
                moveLeft = True
            if event.key == pygame.K_d:
                moveRight = True
        elif event.type == pygame.KEYUP:
            if event.key == pygame.K_w:
                moveUp = False
            if event.key == pygame.K_s:
                moveDown = False
            if event.key == pygame.K_a:
                moveLeft = False
            if event.key == pygame.K_d:
                moveRight = False
            if event.key == pygame.K_c:
                center = True

    clock.tick(FPS) # constrain this loop to the specified FPS                      
    screen.fill(WHITE)

    oldposx = xpos
    oldposy = ypos

    # render the text into an image of the text, colour is red
    textTitle = fontTitle.render("Go Vipers", True, RED)
    # create a rect from the text
    textRect = textTitle.get_rect(center = pygame.display.get_surface().get_rect().center)
    # place this rect at the centre of the screen
    """
    textRect.center = (screenWidth / 2), (screenHeight / 2)
    """
    # blit the image to memory, it will display upon next update
    textRect.move_ip(xpos,ypos)

    textRect.x = xpos
    textRect.y = ypos

    print("x:",xpos,"y:",ypos)

    if moveUp:
        ypos -= speed
    elif moveDown:
        ypos += speed
    if moveLeft:
        xpos -= speed
    elif moveRight:
        xpos += speed
    elif center:
        xpos = 400
        ypos = 300
        center = False

    if xpos > screenWidth - width:
            xpos = oldposx
            ypos = oldposy

    if xpos < 0:
            xpos = oldposx
            ypos = oldposy

    if ypos > screenHeight - height:
            xpos = oldposx
            ypos = oldposy 

    if ypos < 0:
            xpos = oldposx
            ypos = oldposy

    screen.fill(WHITE)
    screen.blit(textTitle, textRect)

    pygame.display.flip()

pygame.quit()
sys.exit()