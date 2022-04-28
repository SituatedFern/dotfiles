# Author: Ashwin Gnanam
# Date: 01/21/21
# File Name: menu_assignment.py
# Description: making a program to decide if a number is even, odd, positive, negative or 0, determine whether a year is a leap year or not and, 
# a person's Astrological sign given the month and day of birth

def script():
    print ("""
    MENU
    ===========================================================
    1. Decide if a number is even, odd, positive, negative or 0
    2. Determine whether a year is a leap year or not
    3. Astrological sign given the month and day of birth
    H. Help 
    Q. Quit
    ===========================================================
    """)                                                                                                            #display menu options as multiline string

    choice = input('Option?: ')                                                                                     #get user's choice

    def numberguess():
        if choice == '1':                                                                                           #Decide if a number is even or odd, positive, negative or 0.
            print("""
            This program will decide if a number is even or odd, positive, negative or 0.
            Please provide the number when asked.
            Press Q at any time to Quit.
            """)

            number = input("What is your number? ")
            if number == 'Q':                                                                                       #this gives the user an option to quit
                print ("bye!")
                exit()
            number = int(number)
            if number > 0:
                sign = "positive"
            if number < 0:
                sign = "negative"
            if number == 0:
                print ("Your number is zero.")
                restart = input ("Start Again? (y/n) type X to go back to the main menu ")                          #asking the user if they want to start again
                if restart == 'y':
                    numberguess()
                if restart == 'X':
                    script()
                else:
                    exit()
            if (number % 2) == 0:
                print(number, "is a", sign, "even number.")
                restart = input ("Start Again? (y/n) type X to go back to the main menu ")                          #asking the user if they want to start again
                if restart == 'y':
                    numberguess()
                if restart == 'X':
                    script()
                else:
                    exit()
            else:
                print(number, "is a", sign, "odd number.")
                restart = input ("Start Again? (y/n) type X to go back to the main menu ")                          #asking the user if they want to start again
                if restart == 'y':
                    numberguess()
                if restart == 'X':
                    script()
                else:
                    exit()
    numberguess()

    def yearcheck():
        if choice == '2':                                                                                           #Determine whether a year is a leap year or not
            print("""
            This program will determine whether a year is a leap year or not.
            Please provide the year when asked.
            Press Q at any time to Quit.
            """)

            yearloop = True
            while yearloop == True:                                                                                 #while loop is created so that the continue function works as intended.
                year = input("What year do you want to check? ")
                if year == 'Q':                                                                                     #this gives the user an option to quit
                    print ("bye!")
                    exit()
                year = int(year)                                                                                    #Changing the year variable into an integer
                if year % 4 == 0:                                                                                   #If the year is evenly divisible by 4, continue.
                    continue
                if year % 4 != 0:                                                                                   #If the year is not evenly divisible by 4, the year is not a leap year.
                    print ("The year is not a leap year (it has 365 days).")
                    restart = input ("Start Again? (y/n) type X to go back to the main menu ")                      #asking the user if they want to start again
                    if restart == 'y':
                        yearcheck()
                    if restart == 'X':
                        script()
                    else:
                        exit()
                if year % 100 == 0:                                                                                 #If the year is evenly divisible by 100, continue.
                    continue
                if year % 100 != 0:                                                                                 #If the year is not evenly divisible by 100, the year is a leap year.
                    print ("The year is a leap year (it has 366 days).")
                    restart = input ("Start Again? (y/n) type X to go back to the main menu ")                      #asking the user if they want to start again
                    if restart == 'y':
                        yearcheck()
                    if restart == 'X':
                        script()
                    else:
                        exit()
                if year % 400 == 0:                                                                                 #If the year is evenly divisible by 400, the year is a leap year.
                    print ("The year is a leap year (it has 366 days).")
                    restart = input ("Start Again? (y/n) type X to go back to the main menu ")                      #asking the user if they want to start again
                    if restart == 'y':
                        yearcheck()
                    if restart == 'X':
                        script()
                    else:
                        exit()
                if year % 400 != 0:                                                                                 #If the year is not evenly divisible by 400, the year is not a leap year.
                    print ("The year is not a leap year (it has 365 days).")
                    restart = input ("Start Again? (y/n) type X to go back to the main menu ")                      #asking the user if they want to start again
                    if restart == 'y':
                        yearcheck()
                    if restart == 'X':
                        script()
                    else:
                        exit()
    yearcheck()

    def astro():
        if choice == '3':
            print ("""
    What is your birthday?

    1. January
    2. Febuary
    3. March
    4. April
    5. May
    6. June
    7. July
    8. August
    9. September
    10. October
    11. November
    12. December
            """)

            month = input("Month: ")
            if month == 'Q':                                                                                        #this gives the user an option to quit
                print ("bye!")
                exit()
            day = input ("Day: ")
            if day == 'Q':                                                                                          #this gives the user an option to quit
                print ("bye!")
                exit()

            month = int(month)
            day = int(day)

            if month == 1: 
                if day < 20: 
                    astro_sign = "Capricorn"
                else:
                    astro_sign = "Aquarius"
                    
            elif month == 2: 
                if day < 19: 
                    astro_sign = "Aquarius"
                else:
                    astro_sign = "Pisces"
                    
            elif month == 3: 
                if day < 21:  
                    astro_sign = "Pisces"
                else:
                    astro_sign = "Aries"
                
            elif month == 4: 
                if day < 20: 
                    astro_sign = "Aries" 
                else:
                    astro_sign = "Taurus"
                    
            elif month == 5: 
                if day < 21: 
                    astro_sign = "Taurus"
                else:
                    astro_sign = "Gemini" 
                    
            elif month == 6: 
                if day < 21: 
                    astro_sign = "Gemini"
                else:
                    astro_sign = "Cancer"
                    
            elif month == 7: 
                if day < 23: 
                    astro_sign = "Cancer"; 
                else:
                    astro_sign = "Leo"
                    
            elif month == 8: 
                if day < 23:
                    astro_sign = "Leo"
                else:
                    astro_sign = "Virgo"
                    
            elif month == 9:
                if day < 23:
                    astro_sign = "Virgo"
                else:
                    astro_sign = "Libra" 
                    
            elif month == 10:
                if day < 23: 
                    astro_sign = "Libra"
                else:
                    astro_sign = "Scorpio"
                    
            elif month == 11:
                if day < 22: 
                    astro_sign = "scorpio"
                else:
                    astro_sign = "Sagittarius"


            elif month == 12:
                if day < 22:
                    astro_sign = "Sagittarius"
                else:
                    astro_sign = "Capricorn"
            print ("Your astrological sign is",astro_sign)
            restart = input ("Start Again? (y/n) type X to go back to the main menu ")                              #asking the user if they want to start again
            if restart == 'y':
                astro()
            if restart == 'X':
                script()
            else:
                exit()
    astro()

    if choice == 'H':
        print("""
    This program will allow you to:
    - Check if a number is even, odd, positive, negative, or zero
    - Determine if a year is a leap year or not
    - Find your astrological sign

    Press Q at any time to Quit.
    Type X when asked to return to main menu.
        """)
        restart = input ("Restart? (y/n) ")                                                                          #asking the user if they want to restart after invalid input
        if restart == 'y':
            script()
        else:
            exit()

    if choice == 'Q':                                                                                               #this gives the user an option to quit
        print ("bye!")
        exit()

    else:
        print('Not a valid choice. Only 1, 2, 3, and Q, are valid choices')
        restart = input ("Restart? (y/n) ")                                                                          #asking the user if they want to restart after invalid input
        if restart == 'y':
            script()
        else:
            exit()
script()