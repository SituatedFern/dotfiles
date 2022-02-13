#   Ashwin Gnanam
#   May 26th 2021
#   This code uses a function to convert the temperature in degrees Celsius to degrees Fahrenheit and vice versa.

def checkInt(msg):
    while True:
        try:
            number = int(input(msg))
            break
        except ValueError:
            print ("Error: Please enter an integer")
    return number

# Function To Convert Celsius To Fahrenheit
# The Parameters Given Are An Integer For Degrees Celsius
# The Function Returns An Integer For Degrees Fahrenheit
def convertCtoF(degc):
    degf = degc*9/5+32
    return degf
def convertFtoC(degf):
    degc = (degf-32)*(5/9)
    return degc

main = True
while main:
    
    # Get User Input
    
    enter = input("Type F to convert fahrenheit to celsius and C to convert celsius to fahrenheit: ")
    if enter =='F':
      far = checkInt("Enter fahrenheit to convert to celsius")

      cel = convertFtoC(far)
      print (far, " fahrenheit is equal to ", cel, " in celsius")

    elif enter =='C':
      cels = checkInt("Enter celsius to convert to fahrenheit")
      fahrenheit = convertCtoF(cels)
      print (cels, " celsius is equal to ", fahrenheit, " in fahrenheit")

    else:
      print("Invalid input")
    
    # Ask User If They Would Like To Do Another Conversion
    again = input("Would you like to do another conversion 'y' or 'n' ")
    if again == "n":
        main = False