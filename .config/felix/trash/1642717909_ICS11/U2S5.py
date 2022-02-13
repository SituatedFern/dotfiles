#   Ashwin Gnanam
#   May 26th 2021
#   This code determines if a year is a leap year or not.

# Main Loop
def checkleapyear(year):
  leapyear=True
  if year%4==0:
    if year%100==0:
      if year%400==0:
        leapyear= True
      else:
        leapyear= False

  else:
    leapyear= False
  
  return(leapyear)

# Check Statements 
year=int(input('What year do you want to check?: '))
leapyear=checkleapyear(year)
print(leapyear)