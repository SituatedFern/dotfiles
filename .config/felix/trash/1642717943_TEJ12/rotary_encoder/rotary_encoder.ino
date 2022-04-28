const int DT = 10; //DT Pin of Rotary Encoder
const int CLK = 9; //CLK pin of Rotary Encoder
const int out1 = 3; //red led
const int out2 = 4; //green led
int Position = 0;
int current_position;
int previous_position;
void setup() {
    pinMode (CLK, INPUT);
    pinMode (DT, INPUT);
    pinMode (out1, OUTPUT);
    pinMode (out2, OUTPUT);
    Serial.begin (9600); //set baud rate
    
    previous_position = digitalRead(CLK); //read current value of CLK
}

    void loop() {
        current_position = digitalRead(CLK);
        if (current_position != previous_position) {
            if (digitalRead(DT) != current_position) {
                Position ++;
                digitalWrite(out1, HIGH); //turn on LED if it's counter clockwise
                    digitalWrite(out2, LOW);
            }
            else {
                Position --;
                digitalWrite(out2, HIGH); //turn on LED if it's counter clockwise
                    digitalWrite(out1, LOW);
            }
            Serial.print("Position:");
            Serial.println(Position);
        }
        previous_position = current_position; //update previous state of CLK with the current state.
    }
