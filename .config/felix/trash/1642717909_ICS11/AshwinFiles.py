# AshwinFiles.py
# Ashwin Gnanam
# May 31th, 2021
# This program reads the tobe.txt file and writes an uppercase version to tobeUPPER.txt

# creating variables for the text files and opening them
original = open("tobe.txt", "r")
uppercase = open ("tobeUPPER.txt", "w")

#main loop
while True:
    text = original.readline() #reading the file line by line
    text = text.rstrip("\n") #stops the text from adding an extra line in between the written lines (I found this command in an article on strings)
    if text=="": #breaking the loop if there is no more text to read
        break
    print (text) #printing text to the console for debugging purposes
    text = text.upper() #making the text variable uppercase
    uppercase.write(text + "\n") #writing the text to the other file (\n forces the input onto another line)

#closing the files
original.close()
uppercase.close()