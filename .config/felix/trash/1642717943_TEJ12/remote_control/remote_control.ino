#include <IRremote.h>
const int RECV_PIN = 7;
IRrecv irrecv(RECV_PIN); //create an object
decode_results results;
const int greenPin = 11;

void setup() {
    irrecv.enableIRIn(); // could also be irrecv.enableIRln();
    irrecv.blink13(true);
    pinMode(greenPin, OUTPUT);
}

void loop() {
    if (irrecv.decode(&results)) {
        switch(results.value) {
            case 0xFFA25D: //keypad button "1" turn on LED
            digitalWrite(greenPin, HIGH);
        }
        switch(results.value) {
            case 0xFF629D: //keypad button "2" turn off LED
            digitalWrite(greenPin, LOW);
        }
        irrecv.resume();
    }
}
