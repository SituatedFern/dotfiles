import clock

print("\n\nTesting Digital Clock Display\n")

my_clock = clock.DigitalClockDisplay(10, 20)
print(f'Display should read 10:20 = {my_clock.display()}')

my_clock = clock.DigitalClockDisplay(8, 10)
print(f'Display should read 08:10 = {my_clock.display()}')

my_clock = clock.DigitalClockDisplay(18, 8)
print(f'Display should read 18:08 = {my_clock.display()}')

print("\n\nTest set time function")
my_clock.set_time(23, 59)
print(f'Display should read 23:59 = {my_clock.display()}')

my_clock.set_time(24, 0)
print(f'Display should read 23:00 = {my_clock.display()}')

my_clock.set_time(23, 61)
print(f'Display should read 23:00 = {my_clock.display()}')

