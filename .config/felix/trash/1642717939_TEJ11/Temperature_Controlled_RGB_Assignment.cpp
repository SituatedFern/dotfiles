//TMP36 Pin Variables

int temperaturePin = A0; //connect TMP36's Vout to A0

void setup()

{
  Serial.begin(9600); 
  
  pinMode (3, OUTPUT );     // Green

  pinMode (5, OUTPUT );     // Blue

  pinMode (6, OUTPUT );     // Red                    
}

void loop()
{

  float temperature = getVoltage(temperaturePin); 
//getting the voltage
//reading from temp sensor             
temperature = (temperature - .5) * 100;

//converting from 10 mv per degree with 500mV offset

//to degrees ((voltage 500mV) times 100)

Serial.println(temperature);

//printing the result

delay(1000);

if (temperature < 17) {
        analogWrite(3, 0);
        analogWrite(5, 255);
        analogWrite(6, 0);
}

else if (temperature > 22) {
        analogWrite(3, 0);
        analogWrite(5, 0);
        analogWrite(6, 255);
}

else {
        analogWrite(3, 255);
        analogWrite(5, 0);
        analogWrite(6, 0);
}

}

// getVoltage() - returns the voltage on the analog input pin 

float getVoltage(int pin){

    return (analogRead(pin) * .004882814);//converting from a 0  
                                        //to 1023 digital
                                        //range to 0 to 5
                                        //volts (each 1
                                        //reading equals ~ 5
                                        //millivolts

}