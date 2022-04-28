#Factorial
def fact(n):
    if n == 0:
        return 1
    return n * fact(n-1)

result = fact(4)

print(result)

#Sum of squares
def sumOfSquares(n):
    if n == 1:
        return 1 

    else:
        return (n*n) + sumOfSquares(n-1)

print(sumOfSquares(4))

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

#Recursive version
"""
reverse_n = 0
def reverse(n):
    global reverse_n
    if n == 0:
        return 0
    else:
        digit = n % 10
        reverse_n = (reverse_n * 10) + digit
        n = n // 10
"""