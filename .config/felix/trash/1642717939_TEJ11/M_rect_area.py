#sample code
"""
print('This program will give you the area of a rectangle: ')
height = input('height') #this is where you input the height of the rectangle
width = input('width') #this is where you input the width of the rectangle
height = int(height) #changing height into a int because it will be a number
width = int(width) #changing the width to a int because it will be a number
area = height * width #area is equal to height times width
area = str(area) #area is changing to a string because it was a int
print('The answer is: ' + area + ' meters’) #the area is in meters so you would
#add meters to the end
"""

#with if statement
print('This program will give you the area of a rectangle: ')
height = int(input('height ')) 
width = int(input('width '))
if height < 0 or width < 0:
    print ("ERROR: Please enter a valid integer.")
else:
    area = height * width
    print('The answer is:',area,'meters')