a = [1,6,5,4]
def sumoflist(a_list):
    if (len(a_list)) == 1:
        return a_list[0]
    else:
        return a_list[0] + sumoflist(a_list[1:])
print(sumoflist(a))