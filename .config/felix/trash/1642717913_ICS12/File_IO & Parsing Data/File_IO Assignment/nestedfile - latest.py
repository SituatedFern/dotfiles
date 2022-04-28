import csv

vroom = 'vroom.csv'

def numberoflines(file):
  with open(file,"r") as f:
    reader = csv.reader(f)
    data = list(reader)
    rowcount = len(data)
    return rowcount

def generatevaluelist(file, linenumber):
  with open (file, "r") as file_in:
    reader = csv.reader(file_in)
    file_in.readline()
    rowlist = []
    for line in reader:
      #rowlist.append(line[0],line[1],line[2],line[3],line[4],line[5],line[6],line[7],line[8],line[10],line[11],line[12]) #!remove all values that are used in the nested dictionary
      location = (line[10],line[11])
      collection = [line[1],line[2],line[3],line[4],line[7],line[5],line[6],line[8],location] #discards the number and number of days left. keeps precise price.
      #rowlist.append(collection)
      listver = {}
      listver[line[0]] = collection
      rowlist.append(listver)
    return (rowlist[linenumber-1])

def mainreader(file):

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
      
      #! PRICE RANGES
      price = int(row["price"])
      if price < 5000:
        zeroto5k.append(generatevaluelist(vroom, readlines))
      elif price < 10000:
          fiveto10k.append(generatevaluelist(vroom, readlines))
      elif price < 15000:
          tento15k.append(generatevaluelist(vroom, readlines))
      elif price < 20000:
          fifteento20k.append(generatevaluelist(vroom, readlines))
      elif price < 25000:
          twentyto25k.append(generatevaluelist(vroom, readlines))
      elif price < 30000:
          twentyfiveto30k.append(generatevaluelist(vroom, readlines))
      elif price < 35000:
          thirtyto35k.append(generatevaluelist(vroom, readlines))
      elif price < 40000:
          thirtyfiveto40k.append(generatevaluelist(vroom, readlines))
      elif price < 45000:
          fortyto45k.append(generatevaluelist(vroom, readlines))
      elif price < 50000:
          fortyfiveto50k.append(generatevaluelist(vroom, readlines))
      elif price < 55000:
          fiftyto55k.append(generatevaluelist(vroom, readlines))
      elif price < 60000:
          fiftyfiveto60k.append(generatevaluelist(vroom, readlines))
      elif price < 65000:
          sixtyto65k.append(generatevaluelist(vroom, readlines))
      elif price < 70000:
          sixtyfiveto70k.append(generatevaluelist(vroom, readlines))
      readlines += 1 #subtract from length of document to determine the row number
      print(f'Current line number: {readlines}')

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
    print("====================================================================")
    print(f'Total lines read: {readlines}')

    ''' #! writing to a file because my terminal doesn't render the entire dictionary (it is too big) uncomment below if you have the same problem
    with open ('dump.txt', "w") as f:
      f.write(str(mydict))
      f.write("====================================================================")
    '''

mainreader(vroom)

#! Make a function called getrowinfo() that takes a line number and finds the information for it