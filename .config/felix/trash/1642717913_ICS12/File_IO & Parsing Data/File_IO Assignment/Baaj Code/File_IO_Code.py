import csv


def get_interlisted():
    with open('interlisted-companies.txt', 'r') as file_in:
        interlisted_corps = []
        file_in.readline()
        for line in file_in:
            line = line.strip()
            line = line.split('\t')
            if line[2] == '':
                line[2] = line[0]
            interlisted_corps.append(line)
        interlisted_corps.pop(0)
        return(interlisted_corps)

def get_optionable():
    with open('optionable_equities.txt', 'r') as file_in:
        optionable_corps = []
        for line in file_in:
            line = line.strip()
            line = line.split('\t')
            optionable_corps.append(line)
        return(optionable_corps)


def create_am_dict():
    stock_dict = {}
    inter_list = get_interlisted()
    for i in inter_list:
        if i[4] not in stock_dict:
            stock_dict[i[4]] = {'TSX': {}, 'TSXV': {}}

    return stock_dict

def create_master_dict():
    master_dict = create_am_dict()
    tickr_dict = create_data_dict()
    inter_list = get_interlisted()
    for i in inter_list:
        x = i[0][-3]
        y = len(i[0])
        tsx_tickr = i[0][-y:-4]
        tsxv_tickr = i[0][-y:-5]
        if x == 'T':
            master_dict[i[4]]['TSX'][tsx_tickr] = tickr_dict[tsx_tickr]
        else:
            master_dict[i[4]]['TSXV'][tsxv_tickr] = tickr_dict[tsxv_tickr]
    return(master_dict) 
    

def create_optionable_list():
    optionable_comps = get_optionable()
    optionable_comps.pop(0)
    optionable_tickrs = []
    for i in optionable_comps:
        optionable_tickrs.append(i[2])
    return optionable_tickrs

def create_tickr_list():
    interlisted_data = get_interlisted()
    interlisted_tickrs = []
    for i in interlisted_data:
        x = i[0][-3]
        y = len(i[0])
        if x == 'T':
            interlisted_tickrs.append(i[0][-y:-4])
        else:
            interlisted_tickrs.append(i[0][-y:-5])     
    return interlisted_tickrs


def create_data_dict():
    tickr_list = create_tickr_list()
    optionable_list = create_optionable_list()
    inter_list = get_interlisted()
    stock_info_dict = {}
    for i in range(0, 295):
        stock_data = []
        x = inter_list[i]
        x.pop(0)
        stock_data.append(x[0])
        stock_data.append(x[1])
        stock_data.append(x[2])
        if tickr_list[i] in optionable_list:
            stock_data.append('True')
        else:
            stock_data.append('False')
        stock_info_dict[tickr_list[i]] = stock_data
    return stock_info_dict
 
def print_to_console():
    x = create_master_dict()
    for NasdaqGM in x:
        print(NasdaqGM)
        for tsx in x[NasdaqGM]:
            print(tsx)
            for tickr in x[NasdaqGM][tsx]:
                print(tickr)
                y = x[NasdaqGM][tsx][tickr]
                print(y)
        
x = create_master_dict()
print_to_console()




