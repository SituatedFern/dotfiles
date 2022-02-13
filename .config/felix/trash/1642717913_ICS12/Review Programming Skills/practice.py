"""
import random

listname = []
count = 0

def even_odd_list(number_values, low_value, high_value):
    global count
    numsofnums = number_values/2 # loop runs twice for no reason so we gotta divide it by 2
    for num in range (int(numsofnums)):
        num = random.randint(low_value, high_value) # setting the random numbers
        temp = num
        if num % 2 == 0 and count % 2 == 0: # if number is even and it should be even
            listname.append(temp)
            count+=1
        if num % 2 != 0 and count % 2 == 0: # if number is odd and it should be even
            listname.append(temp+1)
            count+=1
        if num % 2 == 0 and count % 2 != 0: # if number is odd and it should be odd
            listname.append(temp+1)
            count+=1
        if num % 2 != 0 and count % 2 != 0: # if number is even and it should be odd
            listname.append(temp)
            count+=1

even_odd_list(6,5,20)
print(listname)
"""

"""
def create_school_dictionary(school_codes, school_names):
    mydic = {}
    for name in school_codes:
        for school in school_names:
            mydic[name] = school
            break
    print(mydic)

codes = ['aph','irs']
names = ['abbey park','iroquois ridge']

create_school_dictionary(codes, names)
"""

"""
import math

r = 5

print(f'Arc length in a circle with radius {r} units')

for degree in range(30, 360, 30):
   arc = (degree / 360) * (2 * math.pi * r)

   print(f'{r:>6} units {degree:>7} degree {arc:>10.2f} units')
"""