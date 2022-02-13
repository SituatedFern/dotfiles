import math

class Sun:
    def __init__(self, name, radius, mass, temperature):
        self._name = name
        self._radius = radius
        self._mass = mass
        self._temperature = temperature

    def name(self):
        return self._name

    def radius(self):
        return self._radius

    def temperature(self):
        return self._temperature

    def surface_area(self):
        return 4 * math.pi * self._radius**2
        #SA = 4 · π · r2

    def volume(self):
        return 4/3 * math.pi * self._radius**3
        #V = (4/3) · π · r3

    def change_name(self, new):
        self._name = new

    def change_radius(self, new):
        self._radius = new