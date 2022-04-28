import art_of_war as aow

def find_winner(p1, p2):
    if p1 > p2:
        return("p1 wins this round!")
    if p1 < p2:
        return("p2 wins this round!")

def game_of_war():

    numwins = 0

    d = aow.Deck() #initializes the deck
    d.shuffle() #shuffles the deck

    p1 = aow.Player(d.getHalf(0))
    p2 = aow.Player(d.getHalf(1))

    pile = []
    
    card1 = 0
    card2 = 0
    card3 = 0
    card4 = 0

    while type(card1) != list or type(card2) != list: #problem is that it loops 1 extra time
        looper = True
        card1 = p1.playcard()
        card2 = p2.playcard()

        if type(card1) == list or type(card2) == list:
            break

        print(card1) 
        #print(type(card1))
        print(card2)
        #print(type(card2))
        
        pile.append(card1)
        pile.append(card2)

        if card1 < card2:
            p2.take_cards(pile)
            pile = []

        elif card1 > card2:
            p1.take_cards(pile)
            pile = []

        elif card1 == card2:
            card3 = p1.playcard()
            print(card3)
            #print(type(card3))
            card4 = p2.playcard()
            print(card4)
            #print(type(card4))
            if card3 < card4:
                p2.take_cards(pile)
                pile = []
            elif card3 > card4:
                p1.take_cards(pile)
                pile = []
            print(f"[{numwins}] ================ {find_winner(card3, card4)} =================")
            numwins += 1
            looper = False
        else:
            break
        if looper == True:
            print(f"[{numwins}] ================ {find_winner(card1, card2)} =================")
            numwins += 1
    
        #print(d) #the issue is that d does not decrease as cards are taken

game_of_war()