import astronomy as a

e = a.Planet("earth", "terrestrial", 365)

print(e.name())
print(e.orbit_day())

e.change_orbit_day(366)
print(e.orbit_day())