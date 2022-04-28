# Ashwin Gnanam
# May 26th 2021
# This program finds the greatest common factor of two numbers.

number = 75

# Check Statements
num1 = int(input("First number?: "))
num2 = int(input("Second number?: "))
if num2 > num1:
  b = num2
  num2 = num1
  num1 = b

# Main Loop
while number!=0:
  
  number = (num1%num2)
  if number !=0:
    num1 = num2
    num2 = number
    number = num1%num2
  
# Print On Screen
print("The greatest common factor of these two numbers is: ",num2)