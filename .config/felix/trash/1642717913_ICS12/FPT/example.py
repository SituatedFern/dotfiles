# Example from Video: https://youtu.be/C2QfkDcQ5MU.

class Dog:
    def __init__(self, name, age, friendliness):
        self.name = name
        self.age = age
        self.friendliness = friendliness

    def likes_walks(self):
        return True

    def bark(self):
        return 'Woof!'

class Samoyed(Dog):
    def __init__(self, name, age, friendliness):
        super().__init__(name, age, friendliness)

    def bark(self):
        return 'Arf Arf!'

class Poodle(Dog):
    def __init__(self, name, age, friendliness):
        super().__init__(name, age, friendliness)

    def shedding_amount(self):
        return 0

class GoldenRetriever(Dog):
    def __init__(self, name, age, friendliness):
        super().__init__(name, age, friendliness)

    def fetch_ability(self):
        if self.age < 2:
            return 8

        if self.age < 10:
            return 10

        else:
            return 7

class GoldenDoodle(Poodle, GoldenRetriever):
    def __init__(self, name, age, friendliness):
        super().__init__(name, age, friendliness) #inheritance

    def bark(self): #polymorphism
        return 'AROOOOO!'


sammy = Samoyed('Sammy', 2, 10)
#print(sammy.name, sammy.age, sammy.friendliness)
#print(sammy.likes_walks())

goldie = GoldenDoodle('Goldie', 1, 10)
print(goldie.name, goldie.age, goldie.friendliness)
print(goldie.likes_walks())

print(goldie.shedding_amount(), goldie.fetch_ability()) #inherited from both the parent classes
print(f"Goldie's Bark: {goldie.bark()}")
print(f"Sammy's Bark: {sammy.bark()}")

generic_doggo = Dog('Gene', 10, 10)

print(f"Generic Doggo's Bark: {generic_doggo.bark()}")