"""
AshwinStrings
Ashwin Gnanam
May 28th, 2021
This program displays basic string manipulation methods
"""

# Given the string “VSS Vipers”, have the program print just “SS Viper”
word = "VSS Vipers"
newWord = word[1:10]
print (newWord)

# Given the string “Go Vipers Go”,  have the program print just the first 4 characters
word2 = "Go Vipers Go"
newWord2 = word2[0:-8]
print (newWord2)

# Given the string “Social Distancing”,  have the program print out the number of characters in the string
word3 = "Social Distancing"
numChar = len(word3)
print (numChar)

# Given the string “Flattening The Curve”, have the program print out the index number of the “C”
word4 =  "Flattening The Curve"
findLetter = word4.find("C")
print (findLetter)

# Given the string “Flattening The Curve”, have the program split the string into it’s 3 words.  Print each word out separately
word5 = "Flattening The Curve"
wordOne, wordTwo, wordThree = word5.split(' ') # can set separate variables for each new string
print (wordOne)
print (wordTwo)
print (wordThree)

# Given the string “HeLlO wOrLd”,  have the program print it out in all uppercase letters
word6 = "HeLlO wOrLd"
upperWord = word6.upper()
print (upperWord)

# Given the string “HeLlO wOrLd”, have the program print it out in all lowercase letters
word7 = "HeLlO wOrLd"
lowerWord = word7.lower()
print (lowerWord)

# Given the string “HeLlO wOrLd”, have the program print it out with the first character in uppercase and all the rest in lowercase letters
word8 = "HeLlO wOrLd"
capsWord = word8.capitalize()
print (capsWord)

# Given the string “HeLlO wOrLd”, have the program print it out with all character letter cases inverted (i.e. “hElLo WoRlD”)
word9 = "HeLlO wOrLd"
swapWord = word9.swapcase()
print (swapWord)

# Given the string “To dance or not to dance”, have the program replace all occurances of the word “dance” with “be”.
word10 = "To dance or not to dance"
repWord = word10.replace("dance", "be")
print(repWord)