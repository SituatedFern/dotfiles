//Servo Initialization
#include <Servo.h>                             //This imports the Servo Library Code

Servo myservo;                                  //create servo object to control a servo

int pos = 0;                                     // variable to store the servo position

//TMP36 Pin Variables

int temperaturePin1 = A0; //connect TMP36's Vout to A0
int temperaturePin2 = A1; //connect TMP36's Vout to A1

void setup()

{
//--------------Temperature1----------------

  Serial.begin(9600); 
  
  pinMode (2, OUTPUT );     // Green

  pinMode (3, OUTPUT );     // Blue

  pinMode (4, OUTPUT );     // Red     

//--------------Temperature2----------------

  pinMode (5, OUTPUT );     // Green 2

  pinMode (6, OUTPUT );     // Blue 2

  pinMode (7, OUTPUT );     // Red 2     

//----------------DCMOTOR-------------------

  pinMode(8, OUTPUT); //ENABLE PIN

  pinMode(9, OUTPUT); //MOTOR PIN A

  pinMode(10, OUTPUT); //MOTOR PIN B             

//-----------------SERVO--------------------

  myservo.attach(11);                      // attaches the servo on pin 11 to the servo object

}

void loop()
{

  float temperature1 = getVoltage(temperaturePin1); 
//getting the voltage
//reading from temp sensor             
temperature1 = (temperature1 - .5) * 100;

//converting from 10 mv per degree with 500mV offset

//to degrees ((voltage 500mV) times 100)

Serial.println(temperature1);

//printing the result

delay(1000);

if (temperature1 < 17) {
        analogWrite(2, 0);
        analogWrite(3, 255);
        analogWrite(4, 0);
}

else if (temperature1 > 22) {
        analogWrite(2, 0);
        analogWrite(3, 0);
        analogWrite(4, 255);
}

else {
        analogWrite(2, 255);
        analogWrite(3, 0);
        analogWrite(4, 0);
}

  float temperature2 = getVoltage(temperaturePin2); 
//getting the voltage
//reading from temp sensor             
temperature2 = (temperature2 - .5) * 100;

//converting from 10 mv per degree with 500mV offset

//to degrees ((voltage 500mV) times 100)

Serial.println(temperature2);

//printing the result

if (temperature2 < 17) {
        analogWrite(5, 0);
        analogWrite(6, 255);
        analogWrite(7, 0);
}

else if (temperature2 > 22) {
        analogWrite(5, 0);
        analogWrite(6, 0);
        analogWrite(7, 255);
}

else {
        analogWrite(5, 255);
        analogWrite(6, 0);
        analogWrite(7, 0);
}

if (temperature1 > 22 || temperature2 > 22) {
        //Motor spins clockwise
        digitalWrite(8, HIGH); //ENABLE ON
        digitalWrite(9, LOW); //MOTOR PIN A ON
        digitalWrite(10, HIGH);  //MOTOR PIN B OFF
        myservo.write(180);
}

if (temperature1 < 17 && temperature2 < 17) {
        //Motor stops
        digitalWrite(8, LOW); //ENABLE OFF
        myservo.write(0);
}

if (!(temperature1 < 17 && temperature2 < 17) && !(temperature1 > 22 || temperature2 > 22)){
        //Motor stops
        digitalWrite(8, LOW); //ENABLE OFF
        myservo.write(0);
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