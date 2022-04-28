# Author: Ashwin Gnanam
# Date: 
# File Name: M_rect_area.py
# Description: making a program to calculate the area of a rectangle
def script():
    print('This program will give you the area of a rectangle.')

    print ("""
    MENU
    ==========
    S to start
    H for help
    Q for quit
    ==========
    """)                                                                #display menu options as multiline string

    choice = input('Option?: ')                                         #get user's choice

    if choice == 'H':
        print('This program will give you the area of a rectangle.')
        print('Please provide the height and width when asked.')
        print('Press Q at any time to Quit.')
    elif choice == 'S':
        height = input('height: ')                                      #this is where you input the height of the rectangle
        if height == 'Q':                                               #this gives the user an option to quit
            print ("bye!")
            exit()
        height = int(height)                                            #changing the height to an integer
        if height < 0:                                                  #allows only valid integers to be run
            print ("ERROR: Please enter a valid integer.")
            restart = input ("Restart? (y/n) ")                         #asking the user if they want to restart after invalid input
            if restart == 'y':
                script()
            else:
                exit()
        width = input('width: ')                                        #this is where you input the width of the rectangle
        if width == 'Q':                                                #this gives the user an option to quit
            print ("bye!")
            exit()
        width = int(width)                                              #changing the width to an integer
        if width < 0:                                                   #allows only valid integers to be run
            print ("ERROR: Please enter a valid integer.")
            restart = input ("Restart? (y/n)")                          #asking the user if they want to restart after invalid input
            if restart == 'y':
                script()
            else:
                exit()
        else:
            area = height * width                                       #area is equal to height times width
            print('The answer is:',area,'meters')                       #printing the area
            restart = input ("Start Again? (y/n) ")                     #giving the user the option to restart the code after giving the answer
            if restart == 'y':
                script()
            else:
                exit()

    elif choice == 'Q':                                                 #this gives the user an option to quit
        print ("bye!")
        exit()

    else:
        print('Not a valid choice. Only S, H, and Q, are valid choices')
        restart = input ("Restart? (y/n)")                          #asking the user if they want to restart after invalid input
        if restart == 'y':
            script()
        else:
            exit()
script()