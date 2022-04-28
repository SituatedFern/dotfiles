import csv

def parse_pokidex(filename):
    with open(filename, "r") as file_in:

        reader = csv.reader(file_in)
        grass = []
        fire = []
        water = []
        bug = []
        normal = []
        poison = []
        electric = []
        ground = []
        fairy = []
        fighting = []
        psychic = []
        rock = []
        ghost = []
        ice = []
        dragon = []
        dark = []
        steel = []
        flying = []

        for line in reader:
            pokidata = []
            pokidata.append(line[1]) #Name
            pokidata.append(line[3]) #Type2   
            pokidata.append(line[4]) #Total
            pokidata.append(line[5]) #HP
            pokidata.append(line[6]) #Attack
            pokidata.append(line[7]) #Defense
            pokidata.append(line[8]) #Sp. Atk
            pokidata.append(line[9]) #Sp. Def
            pokidata.append(line[10]) #Speed
            pokidata.append(line[11]) #Generation
            pokidata.append(line[12]) #Legendary?

            if line[2] == "Grass":
                grass.append(pokidata)
            if line[2] == "Fire":
                fire.append(pokidata)
            if line[2] == "Water":
                water.append(pokidata)
            if line[2] == "Bug":
                bug.append(pokidata)
            if line[2] == "Normal":
                normal.append(pokidata)
            if line[2] == "Poison":
                poison.append(pokidata)
            if line[2] == "Electric":
                electric.append(pokidata)
            if line[2] == "Ground":
                ground.append(pokidata)
            if line[2] == "Fairy":
                fairy.append(pokidata)
            if line[2] == "Fighting":
                fighting.append(pokidata)
            if line[2] == "Psychic":
                psychic.append(pokidata)
            if line[2] == "Rock":
                rock.append(pokidata)
            if line[2] == "Ghost":
                ghost.append(pokidata)
            if line[2] == "Ice":
                ice.append(pokidata)
            if line[2] == "Dragon":
                dragon.append(pokidata)
            if line[2] == "Dark":
                dark.append(pokidata)
            if line[2] == "Steel":
                steel.append(pokidata)
            if line[2] == "Flying":
                flying.append(pokidata)
            
            typelist = {"Grass": grass, "Fire": fire, "Water": water, "Bug": bug, "Normal": normal, "Poison": poison, "Electric": electric, "Ground": ground, "Fairy": fairy, "Fighting": fighting, "Psychic": psychic, "Rock": rock, "Ghost": ghost, "Ice": ice, "Dragon": dragon, "Dark": dark, "Steel": steel, "Flying": flying,}
            
            #print (f'Number: {line[0]} Name: {line[1]}')
        
        print(typelist)

        f = open("output.txt", "a")
        typeliststr = str(typelist)
        f.write(typeliststr)
        f.close()

parse_pokidex("Pokemon.csv")