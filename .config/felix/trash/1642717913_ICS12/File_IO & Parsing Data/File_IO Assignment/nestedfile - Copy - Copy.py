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

def dictreadertest(file):

  allcars = {}

  with open(file, "r") as file_in:

    dictreader = csv.DictReader(file_in)
    for row in dictreader:
      #print(row["brand"]) #!you can print a specific column if needed
      allcars[row["price"]] = row #putting all the cars in the dataset into a dictionary with the number as the key
      #filter by price range here.
    print(allcars)

dictreadertest(vroom)