def parse_braille_file(filename):
    with open(filename) as f:
        fullcont = f.readlines()
        linecount = len(fullcont)-3
    for n in range (0,linecount,3):
        l1 = len(fullcont[n])
        for i in range (2,l1,2):
            print (fullcont[n][i-2:i])
            print (fullcont[n+1][i-2:i])
            print (fullcont[n+2][i-2:i])
            print ("")
parse_braille_file("data22.txt")