## PCB files

These are the hardware design files for the open scoreboard project.

The current design is based off of an nRF52833 with an RGB LED grid laid out as a scoreboard.

Version 0.1 controlled the LED's directly.  
This worked but required many pins and led to flickering and ghosting and lacked some creature comforts such as recharchable battery. 4 LEDs per segment also did not look great.

Version 0.2 attepted to switch to WLEDs.
This pulled far too much current and created heat problems. Battery charging and the larger NFC antenna were a success though.

The current version, 0.3 goes back to normal LEDs, but passes the control off to an LED grid controller. With lipo battery, improved NFC, Piezo, USB, 5 LED segments, and lower part count.
