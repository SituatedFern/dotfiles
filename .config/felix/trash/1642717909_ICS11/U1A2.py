import pygame
import sys
import time
pygame.init()

size = (800,600)
screen = pygame.display.set_mode(size,0)
pygame.display.set_caption("Animation Test")

WHITE = (255,255,255)
GREEN = (0,255,0)
BLUE = (0,0,255)
RED = (255,0,0)

screen.fill(WHITE)
pygame.display.update()

x = 25
y = 575
dx = 5
dy = 5
go = True
while go:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            go = False
    
    time.sleep(0.01)
    screen.fill(WHITE)

    x = x + dx
    if (x>=775):
        dx = 0
        y = y - dy
        if (y<=25):
            dy = 0

    pygame.draw.circle (screen, BLUE, (x,y),50, 0)
    pygame.display.update()

pygame.quit()
sys.exit()