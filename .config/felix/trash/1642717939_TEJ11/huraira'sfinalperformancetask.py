#// menu //
ans=True
while ans:
    print ("""""
    1.Binary to Decimal
    2.Decimal to Binary
    3.Decimal to Hex
    4.Hex to Decimal
    5.Hex to Binary
    """"")
    reeeeeeee = input("What do you want to convert?")
    if reeeeeeee =="1":
      #Convert binary to decimal
      #This is required string input and return integer value
      def binToDec(binary):
          exp = len(binary) -1
          sum = 0
          #  1        1         1           1
          # 2^(4-1)  2^(2)    2^1         2^0
          for d in binary:
              if d == "1":
                sum = sum + 2**exp
          exp = exp -1
          return(sum)

      binary= input("Please enter a binary number: ")
      print("The decimal value of", binary, "is", binToDec(binary))

    elif reeeeeeee =="2":
      #// decimal to Binary//
      def decimalToBinary(decimal):
          """This function converts decimal number
          to binary and prints it"""
          
          binary = 0
          ctr = 0
          temp = decimal  #copying number
           
          #calculating binary
          while(temp > 0):
              binary = ((temp%2)*(10**ctr)) + binary
              temp = int(temp/2)
              ctr += 1
                 
          print("Binary of {x} is: {y}".format(x=decimal,y=binary))

      decimal = int(input("Enter a decimal number: \n"))
      decimalToBinary(decimal)

    elif reeeeeeee =="3":
      #// decimal to hex //
      def main():
          og_dec_value = int(input("Enter decimal value: "))
          print(og_dec_value,"is equal to",decToHex(og_dec_value), "in hexadecimal")

      def decToHex(dec_value):
          ret_val = str()
          while dec_value > 0:
              hex_value=dec_value%16
              dec_value=dec_value//16
              ret_val = getHexChar(hex_value) + ret_val
          return ret_val

      def getHexChar(dec_digit):
          if dec_digit < 10:
              return str(dec_digit)
          if dec_digit == 10:
              return "A"
          if dec_digit == 11:
              return "B"
          if dec_digit == 12:
              return "C"
          if dec_digit == 13:
              return "D"
          if dec_digit == 14:
              return "E"
          if dec_digit == 15:
              return "F"

      main()

    elif reeeeeeee == "4":
     #// hex to decimal //
        #input string
        string = (input("Enter hex value: "))
        # converting hexadecimal string to decimal
        res = int(string, 16)
        # print result
        print("The decimal number associated with hexadecimal string is : " + str(res))

    elif reeeeeeee == "5":
      #// hex to binary //
      #input string
      lololololol = (input("Enter hex value: "))
      # converting hexadecimal string to decimal
      bruh = int(lololololol, 16)

      def decimalToPeepee(num):
          if num > 1:
              decimalToPeepee(num // 2)
          print(num % 2, end='')
          decimalToPeepee(bruh)