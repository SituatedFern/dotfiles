#Reverse of numbers in int n
def rev(n):
    
    # Initiate value to null  
    revs_n = 0  
    
    # reverse the integer number using the while loop  
    
    while (n > 0):  
        # Logic  
        digit = n % 10
        print(digit)
        revs_n = (revs_n * 10) + digit
        n = n // 10
    
    # Display the result
    print(f"The reverse number is : {revs_n}")
rev(342)

#Reverse of numbers in int n
# Python Program to Reverse a Number using Recursion

Reverse = 0

# Defining a Recursive Function
def Reverse_Integer(Number):
    global Reverse
    if(Number > 0):
        Reminder = Number %10
        Reverse = (Reverse *10) + Reminder
        Reverse_Integer(Number //10)
    return Reverse

# Take the Input From the User
Number = int(input("Enter any Number: "))
Reverse = Reverse_Integer(Number)
print("Reverse of entered number is = %d" %Reverse)