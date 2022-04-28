#Number 1
"""
import math
r = 7
v = ((4/3)*(math.pi)*r**3)
v = format (v, '.2f')
print ("the volume is: ", v, "units")
"""

#Number 2
"""
cprice = 22.95
cprice = cprice - cprice*0.30
print (cprice)
amount = 50
shipping = 0.65*(amount-1)
print (shipping)
wprice = (cprice * amount) + (shipping + 2)
print (wprice)
"""

#Number 3
"""
SECONDS = 1
MINUTES = 60 * SECONDS
HOURS = 60 * MINUTES

# All these results are in seconds

time_left_house = 6 * HOURS + 52 * MINUTES

miles_run_easy_pace = 2 * (8 * MINUTES + 15 * SECONDS)

miles_run_fast_pace = 3 * (7 * MINUTES + 12 * SECONDS)

total_time_run = miles_run_easy_pace + miles_run_fast_pace + time_left_house

# So we now have a big number of seconds to split into hours/minutes/seconds

hours = total_time_run // HOURS

# the left over part is minutes and seconds (still in seconds)

part_hour = total_time_run % HOURS
minutes = part_hour // MINUTES
seconds = part_hour % MINUTES

print (f"Total time run: {total_time_run}, Hours: {hours}, Minutes: {minutes}, Seconds: {seconds}")
"""

#Integer Input and Sum
"""
num1 = int(input("number 1: "))
num2 = int(input("number 2: "))
num3 = int(input("number 3: "))
sum = num1 + num2 + num3
print ("The sum of these numbers is: ", sum)
"""

#Dinner Budgeting Problem
"""
day = 1
for counter in range(5):
    print ("Day", day)
    startmoney = int(input("How Much Money Did You Have Today? "))
    DinnerCost = int(input("How much money did you spend on school dinner today? "))
    endmoney = startmoney - DinnerCost
    print ("You have $",endmoney, "remaining in your account.")
    if endmoney < 0:
        print ("WARNING: You do not have enough money in your account.")
    day = day + 1
"""