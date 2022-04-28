
class DigitalClockDisplay:

    def __init__(self, hour, minute):

        self._hour_limit = 24
        self._hour = hour

        self._minute_limit = 60
        self._minute = minute

    def display(self):
        pass
        

    def time_tick(self):

        self._hour += (self._minute + 1) // self._minute_limit
        self._hour = self._hour % self._hour_limit
        
        self._minute = (self._minute + 1) % self._minute_limit


    def set_minute(self, minute):
        pass

    def set_hour(self, hour):
        pass

    def set_time(self, hour, minute):
        pass
            
