def parse_braille_file(filename):
    braile_list = []
    with open(filename) as f:
        fullcont = f.readlines()
        linecount = len(fullcont)-3
    for n in range (0,linecount,3):
        l1 = len(fullcont[n])
        for i in range (2,l1,2):
            braile = fullcont[n][i-2:i]
            braile += fullcont[n+1][i-2:i]
            braile += fullcont[n+2][i-2:i]
            braile_list.append(braile)
    return braile_list

def translate_braille(phrase):
    braile_dict = {'xooooo': 'a', 'xoxooo': 'b', 'xxoooo': 'c', 'xxoxoo': 'd', 'xooxoo': 'e', 'xxxooo': 'f', 'xxxxoo': 'g',
                   'xoxxoo': 'h', 'oxxooo': 'i', 'oxxxoo': 'j', 'xoooxo': 'k', 'xoxoxo': 'l', 'xxooxo': 'm', 'xxoxxo': 'n',
                   'xooxxo': 'o', 'xxxoxo': 'p', 'xxxxxo': 'q', 'xoxxxo': 'r', 'oxxoxo': 's', 'oxxxxo': 't','xoooxx': 'u',
                   'xoxoxx': 'v', 'oxxxox': 'w', 'xxooxx': 'x', 'xxoxxx': 'y', 'xooxxx': 'z', 'oooooo': ' '}
    
    translated_phrase = ''
    for i in phrase:
        letter = braile_dict[i]
        translated_phrase += letter

    return translated_phrase



x = parse_braille_file("data22.txt")

print(translate_braille(x))