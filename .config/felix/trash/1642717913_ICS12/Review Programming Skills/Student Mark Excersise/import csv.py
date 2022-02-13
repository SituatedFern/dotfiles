import csv

marksDict = {}
studentDict = {}
classDict = {}

def createstudentdict(filename):
    with open (filename) as file_in:
        reader = csv.reader(file_in)
        for line in reader:
            studentDict[line[0]] = line[2]
            if line[1] not in marksDict:
                marksDict[line[1]] = studentDict
            
        print (studentDict)

createstudentdict('courseMarks.csv')
'''
def createmarksdict(students):
    for key in students:
        students
    print("bruh our teacher sucks.")



        if course not in marksDict:
            marksDict[course] = {}
'''