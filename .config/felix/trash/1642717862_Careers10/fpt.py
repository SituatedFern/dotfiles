# Author: Ashwin Gnanam
# Date: 01/26/21
# File Name: fpt.py
# Description: This program allows the user to calculate the conversion between different number systems with a simple menu.

#// menu //
def main():
    print ("""
    MENU
    ========================
    1. Binary to Decimal
    2. Decimal to Binary
    3. Decimal to Hex
    4. Hex to Decimal
    5. Hex to Binary
    H. Help
    Q. Quit
    ========================
    """)
    
    choice = input("What do you want to convert? ")

    def bintodec():
        if choice == '1':
            #Binary to decimal
            num = input("Enter binary number: ")
            if num == 'Q':                                                                                      #this gives the user an option to quit
                print ("bye!")
                exit()
            num = int(num)                                                                                      #changing the variable num into an integer
            binary_val = num
            decimal_val = 0
            base = 1
            while num > 0:
                rem = num % 10
                decimal_val = decimal_val + rem * base
                num = num // 10
                base = base * 2
            print("Binary Number is", binary_val, "and Decimal Number is", decimal_val)                         #printing the result
            restart = input ("Start Again? (y/n) type X to go back to the main menu ")                          #asking the user if they want to start again
            if restart == 'y':
                bintodec()
            if restart == 'X':
                main()
            else:
                exit()
    bintodec()

    def dectobin():
        if choice == '2':
            #Decimal to Binary
            num = input("Enter decimal number: ")
            if num == 'Q':
                print ("bye!")
                exit()
            num = int(num)                                                                                      #changing the variable num into an integer
            binout = int(bin(num)[2:])
            print ("Decimal Number is", num, "and Binary Number is", binout)                                    #printing the result
            restart = input ("Start Again? (y/n) type X to go back to the main menu ")                          #asking the user if they want to start again
            if restart == 'y':
                dectobin()
            if restart == 'X':
                main()
            else:
                exit()
    dectobin()

    def dectohex():
        if choice == '3':
            #Decimal to Hex
            num = input("Enter decimal number: ")
            if num == 'Q':                                                                                      #allowing the user to quit if they want
                print ("bye!")
                exit()
            num = int(num)                                                                                      #changing the variable num into an integer
            hexout = hex(num)[2:]
            print ("Decimal Number is", num, "and Hex Number is", hexout)                                       #printing the result
            restart = input ("Start Again? (y/n) type X to go back to the main menu ")                          #asking the user if they want to start again
            if restart == 'y':
                dectohex()
            if restart == 'X':
                main()
            else:
                exit()
    dectohex()
    
    def hextodec():                                                                                             #creating a function so that we can go back to this section of the code if needed
        if choice == '4':
            #Hex to decimal
            string = input("Enter hex value: ")
            if string == 'Q':                                                                                   #this gives the user an option to quit
                print ("bye!")
                exit()
            res = int(string, 16)                                                                               # converting hexadecimal string to decimal
            res = int(res)
            print("The decimal number associated with hexadecimal string is:",res)                              #printing the result
            restart = input ("Start Again? (y/n) type X to go back to the main menu ")                          #asking the user if they want to start again
            if restart == 'y':
                hextodec()
            if restart == 'X':
                main()
            else:
                exit()
    hextodec()
    
    def hextobin():
        if choice == '5':
            #Hex to Binary
            num = input("Enter hex value: ")
            if num == 'Q':                                                                                      #this gives the user an option to quit
                print ("bye!")
                exit()
            res = int(num, 16)                                                                                  #converting hexadecimal string to decimal
            binout = bin(res)[2:]                                                                               #converting the decimal to a hex value
            print ("Hex Number is", num, "and Binary Number is", binout)                                        #printing the result
            restart = input ("Start Again? (y/n) type X to go back to the main menu ")                          #asking the user if they want to start again
            if restart == 'y':
                hextodec()
            if restart == 'X':
                main()
            else:
                exit()
    hextobin()

    if choice == 'H':
        print("""
    This program will allow you to convert to different number systems.

    Type Q in any input field to Quit.
    Type X when asked to return to main menu.
        """)
        restart = input ("Restart? (y/n) ")                                                                     #asking the user if they want to restart after invalid input
        if restart == 'y':
            main()
        else:
            exit()

    if choice == 'Q':                                                                                           #this gives the user an option to quit
        print ("bye!")
        exit()

    else:
        print('Not a valid choice. Only 1, 2, 3, and Q, are valid choices')
        restart = input ("Restart? (y/n) ")                                                                     #asking the user if they want to restart after invalid input
        if restart == 'y':
            main()
        else:
            exit()
main()