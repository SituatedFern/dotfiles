import art_of_war as aoc

d = aoc.Deck()
d.shuffle()
p = aoc.Player(d.getHalf(0))
pile = []
#print(d)
print(d.getHalf(0)) 
print(d.getHalf(1)) 
print(p.playcard())

print(p.check_empty())