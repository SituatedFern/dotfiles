import csv

file = 'USA_cars_datasets.csv'

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


pricedict = {}
branddict = {}
colourdict = {}
statedict = {}

def tablecreator(filename):
    with open(filename, "r") as file_in:

        reader = csv.reader(file_in)

        file_in.readline() #skipping the header

        for line in reader: #iterating through all the lines
            #printing the first file as a table.
            #print(f'{line}')

            #! PRICES
            price = int(line[1])
            if price > 0 and price < 5000:
                zeroto5k.append(line)
            if price > 5000 and price < 10000:
                fiveto10k.append(line)
            if price > 10000 and price < 15000:
                tento15k.append(line)
            if price > 15000 and price < 20000:
                fifteento20k.append(line)
            if price > 20000 and price < 25000:
                twentyto25k.append(line)
            if price > 25000 and price < 30000:
                twentyfiveto30k.append(line)
            if price > 30000 and price < 35000:
                thirtyto35k.append(line)
            if price > 35000 and price < 40000:
                thirtyfiveto40k.append(line)
            if price > 40000 and price < 45000:
                fortyto45k.append(line)
            if price > 45000 and price < 50000:
                fortyfiveto50k.append(line)
            if price > 50000 and price < 55000:
                fiftyto55k.append(line)
            if price > 55000 and price < 60000:
                fiftyfiveto60k.append(line)
            if price > 60000 and price < 65000:
                sixtyto65k.append(line)
            if price > 65000 and price < 70000:
                sixtyfiveto70k.append(line)

            #! Filter by brand
            brandkey = line[2]
            branddict[brandkey] = line

            #! Filter by colours
            capkey = line[7]
            colourdict[capkey] = line

            #! Filter by state
            statekey = line[10]
            statedict[statekey] = line

        
        file_in.close()

tablecreator(file)

pricedict = {"0-5k": zeroto5k, "5-10k": fiveto10k, "10-15k": tento15k, "15-20k": fifteento20k, "20-25k": twentyto25k, "25-30k": twentyfiveto30k, "30-35k": thirtyto35k, "35-40k": thirtyfiveto40k, "40-45k": fortyto45k, "45-50k": fortyfiveto50k, "50-55k": fiftyto55k, "55-60k": fiftyfiveto60k, "60-65k": sixtyto65k, "65-70k": sixtyfiveto70k}

#print(f'{pricedict}')
print(f'{pricedict.keys()}')
print(f'{branddict.keys()}') # within this ^
print(f'{colourdict.keys()}') # within this ^
print(f'{statedict.keys()}') # within this ^