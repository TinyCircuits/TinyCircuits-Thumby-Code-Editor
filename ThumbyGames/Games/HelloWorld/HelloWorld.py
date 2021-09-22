import time
import thumby
import math

# BITMAP: width: 32, height: 32
bitmap0 = (0,0,0,0,0,0,0,0,248,8,232,40,40,40,40,40,40,40,40,40,40,232,8,248,0,0,0,0,0,0,0,0,
           0,0,0,0,0,0,0,0,255,0,63,32,32,32,32,32,32,32,32,32,32,63,0,255,0,0,0,0,0,0,0,0,
           0,0,0,0,0,0,0,0,255,0,12,12,63,63,12,12,0,0,24,24,3,3,0,255,0,0,0,0,0,0,0,0,
           0,0,0,0,0,0,0,0,31,16,16,16,16,20,18,16,20,18,16,16,16,16,16,31,0,0,0,0,0,0,0,0)

while(1):
    
    t0 = time.ticks_us() # Check the time
    thumby.display.fill(0)
    
    spriteX = int((thumby.DISPLAY_W/2)-(32/2))
    spriteY = int(round((40/2)-(32/2) + math.sin(t0 / 250000) * 5))
    
    thumby.display.blit(bitmap0, spriteX, spriteY, 32, 32)
    thumby.display.update()