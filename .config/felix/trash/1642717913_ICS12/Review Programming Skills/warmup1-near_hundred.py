def near_hundred(n):
    if n < 100:
        temp = 100 - n
        temp = abs(temp)
        if temp <= 10:
            return True
        if temp > 10:
            return False
    if n > 100 and n < 200:
        temp = 200 - n
        temp = abs(temp)
        temp1 = n - 100
        temp1 = abs(temp1)

        if temp1 < temp:
            if temp1 <= 10:
                return True
            if temp1 > 10:
                return False
        
        if temp1 > temp:
            if temp <= 10:
                return True
            if temp > 10:
                return False

    if n >= 200:
        temp = n - 200
        temp = abs(temp)
        if temp <= 10 or temp == 0:
            return True
        if temp > 10:
            return False