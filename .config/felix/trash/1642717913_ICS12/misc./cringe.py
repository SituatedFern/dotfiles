# Select Sort Geeks for Geeks
a = [5,4,3,6,3]
def selectsortgeeks(unsorted):
    
    bruh = len(unsorted)
    for n in range(0,bruh):
        smolnum = n
        for i in range(n+1, bruh):
            if unsorted[smolnum] > unsorted[i]:
                smolnum = i
        unsorted[n], unsorted[smolnum] = unsorted[smolnum], unsorted[n]

    return unsorted 

print (f'Geeks For Geeks Example:\n{selectsortgeeks(a)}')

#Select Sort Ex. 1
def selectsort(unsorted):
    empty = []
    for i in range (0, len(unsorted)):
        empty.append(min(unsorted))
        unsorted.remove(min(unsorted))
    return empty
print (f'Question 1, Ex. 1:\n{selectsort(a)}')

#Select Sort Ex. 2

