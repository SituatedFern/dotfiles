# Ashwin Gnanam
# May 26th 2021
# This code gets two points on a line and returns the values for slope and y intercept of the line. 

# Check Statements 
def findline(x1,y1,x2,y2):
  slope = (y1-y2)/(x1-x2)
  intercept = y1 - slope*x1
  return(slope,intercept)
x1 = int(input("X coordinate for point  1: "))
y1 = int(input("Y coordinate for point  1: "))
x2 = int(input("X coordinate for point  2: "))
y2 = int(input("Y coordinate for point  2: "))

# Equation 
slope,intercept = findline(x1,y1,x2,y2)
print("Slope: ",slope,'and Y Intercept: ',intercept)