import csv
'''
def text():
  with open('cmon2.txt') as f:
    lines = f.readlines()

  output = {}

  for s in lines: 
    split_line = s.split(",")
    first = split_line[0].strip()
    output[first] = {}
    output[first]['Price Ranges'] = {} #split_line[1].strip()
    output[first]['Price Ranges'] = {}
    pairs = []
    for i in range(0, len(split_line[2:]), 2):
      pairs.append(split_line[2:][i:i+2])

    for pair in pairs:
      day = pair[0].strip()
      output[first].setdefault(day, []).append(pair[1].strip())

  print (output)
text()
'''
vroom = 'vroom.csv'

def new(filename):
  with open(filename, "r") as file_in:

    reader = csv.reader(file_in)

    output = {} #creating an output variable

    file_in.readline() #skipping the header

    for line in reader: #iterating through all the lines
      #printing the first file as a table.
      make = line[2]
      model = line[3]
      year = line[4]
      country = line[11]
      state = line[10]
      colour = line[7]
      location = (country,state)

      check = {} #new variable that goes into a list so that cars of the same make can still be added.
      check[model] = {}
      check[model][year] = {}
      check[model][year][colour] = location
      print(check)

      output[make] = []

      output[make].append(check)

    print(f'{output}')
    #? {price range, brand, colour, state}
new(vroom)

print("====================================================================")

def numberoflines(file):
  with open(file,"r") as f:
    reader = csv.reader(f)
    data = list(reader)
    rowcount = len(data)
    return rowcount

def dictreadertest(file):

  allcars = {}
  numbersort = {}
  readlines = 0

  #?define price ranges
  zeroto5k = []
  fiveto10k = []
  tento15k = []
  fifteento20k = []
  twentyto25k = []
  twentyfiveto30k =[]
  thirtyto35k = []
  thirtyfiveto40k = []
  fortyto45k = []
  fortyfiveto50k = []
  fiftyto55k = []
  fiftyfiveto60k = []
  sixtyto65k = []
  sixtyfiveto70k = []

  with open(file, "r") as file_in:
    #add rowlist here

    dictreader = csv.DictReader(file_in)

    for row in dictreader:
      #print(row["brand"]) #!you can print a specific column if needed
      allcars[row["price"]] = row #putting all the cars in the dataset into a dictionary with the number as the key
      #filter by price range here.

      numbersort[row["number"]] = row
      
      #! PRICE RANGES
      price = int(row["price"])
      if price < 5000:
        zeroto5k.append(row)
      elif price < 10000:
          fiveto10k.append(row)
      elif price < 15000:
          tento15k.append(row)
      elif price < 20000:
          fifteento20k.append(row)
      elif price < 25000:
          twentyto25k.append(row)
      elif price < 30000:
          twentyfiveto30k.append(row)
      elif price < 35000:
          thirtyto35k.append(row)
      elif price < 40000:
          thirtyfiveto40k.append(row)
      elif price < 45000:
          fortyto45k.append(row)
      elif price < 50000:
          fortyfiveto50k.append(row)
      elif price < 55000:
          fiftyto55k.append(row)
      elif price < 60000:
          fiftyfiveto60k.append(row)
      elif price < 65000:
          sixtyto65k.append(row)
      elif price < 70000:
          sixtyfiveto70k.append(row)
      readlines += 1 #subtract from length of document to determine the row number
      print(f'Current line number: {readlines}')

    #print(allcars)
    #TODO: create a dictionary for number(or some other value) for organizational purposes
    #TODO: also create a list for all of the values in the row so that there will be no duplicates.
    
    '''
    print(f'$0-5k: {zeroto5k}') #make these values into dictionaries
    print(f'$5-10k: {fiveto10k}')
    print(f'$10-15k: {tento15k}')
    print(f'$15k-20k: {fifteento20k}')
    print(f'$20-25k: {twentyto25k}')
    print(f'$25-30K: {twentyfiveto30k}')
    print(f'$30-35k: {thirtyto35k}')
    print(f'$35-40k: {thirtyfiveto40k}')
    print(f'$40-45k: {fortyto45k}')
    print(f'$45-50k: {fortyfiveto50k}')
    print(f'$50-55k: {fiftyto55k}')
    print(f'$55-60k: {fiftyfiveto60k}')
    print(f'$60-65k: {sixtyto65k}')
    print(f'$65-70k: {sixtyfiveto70k}')
    '''

    mydict = {}
    mydict['$0-5k'] = zeroto5k
    mydict['$5-10k'] = fiveto10k
    mydict['$10-15k'] = tento15k
    mydict['$15-20k'] = fifteento20k
    mydict['$20-25k'] = twentyto25k
    mydict['$25-30k'] = twentyfiveto30k
    mydict['$30-35k'] = thirtyto35k
    mydict['$35-40k'] = thirtyfiveto40k
    mydict['$40-45k'] = fortyto45k
    mydict['$45-50k'] = fortyfiveto50k
    mydict['$50-55k'] = fiftyto55k
    mydict['$55-60k'] = fiftyfiveto60k
    mydict['$60-65k'] = sixtyto65k
    mydict['$65-70k'] = sixtyfiveto70k
    print(mydict)
    print("===========================================================")
    print(f'Total lines read: {readlines}')


    #print(numbersort)


dictreadertest(vroom)

def generatevaluelist(file):
  with open (file, "r") as file_in:
    reader = csv.reader(file_in)
    file_in.readline()
    rowlist = []
    for line in reader:
      #rowlist.append(line[0],line[1],line[2],line[3],line[4],line[5],line[6],line[7],line[8],line[10],line[11],line[12]) #!remove all values that are used in the nested dictionary
      bruh = line[1],line[2],line[3],line[4],line[5],line[6],line[7],line[8],line[10],line[11]
      rowlist.append(bruh)
    #print(rowlist[readlines-1]) #?this will work later
    print(rowlist)
#call the finished function
print("===============================================================")
generatevaluelist(vroom)
#! Make a function called getrowinfo() that takes a line number and finds the information for it