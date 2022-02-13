import sun as a

print("\n\nTesting Sun\n")

s = a.Sun('sun', 696340, 1.989, 5600)
print(f'Radius is {s.radius()}')
print(f'Temperature is {s.temperature()}')
print(f'Volume should be 1.414336139666311e+18 = {s.volume()}')
print(f'Surface Area should be 6093299852082.22 = {s.surface_area()}')

s.change_name('The Sun')
print(f'\nThe new name should be The Sun = {s.name()}')

s.change_radius(1000)
print(f'\nRadius is {s.radius()}')
print(f'Volume should be 4188790204.7863903 = {s.volume()}')
print(f'Surface Area should be 12566370.614359172 = {s.surface_area()}')


print("\n\n\nTesting Tau Ceti\n")
tau_ceti = a.Sun('tau ceti', 551690, 1.557, 5071)


print(f'Radius is {tau_ceti.radius()}')
print(f'Temperature is {tau_ceti.temperature()}')
print(f'Volume should be 7.033539733032631e+17 = {tau_ceti.volume()}')
print(f'Surface Area should be 3824723884626.855 = {tau_ceti.surface_area()}')

tau_ceti.change_name('Tau Ceti')
print(f'\nThe new name should be Tau Ceti = {tau_ceti.name()}')

