meta:
  date: 2014-06-17 15:00:00
  title: Meatmon
  subtitle: Smoking meat with wireless firmata

Inspired by a recent trip to the Adirondacks during which a good friend blew my
mind with some awesome food and great company, I wanted to give hot smoking a
beef brisket a go. Despite a few successes with cold smoking bacon and salmon,
I'd never actually hot smoked anything. I'm sure people get a feel for it as
time passes and they get to know their smoker better, but I wanted to take a
more scientific approach.

I bought a piece of brisket from local artisan butchers [Flock & Herd](http://www.flockandherd.com/)
and after a short consultation with [Huey](https://twitter.com/bambuninunhead)
(owner of the [awesome deli at the end of the road](http://www.bambuni.co.uk/)
and generally opinionated foodie), covered it in molasses and a home-made rub
(liberal amounts of garlic salt, celery salt, paprika, pepper and onion powder)
and left it in the fridge for a couple of days.

![Sitting in the rub](https://raw.githubusercontent.com/achingbrain/meatmon/master/assets/rub.jpg)

## Temperature control

The Internet tells me that [I should keep the meat at 225°F for 75 minutes per pound](http://www.thesmokerking.com/page1a.html),
which I unscientifically converted into new money as about 105°C for 35 minutes
per kilogram.  When the brisket reaches 75°C, wrap it in foil until it makes it
to 85°C and you are more or less done.

The ambient temperature inside the smoker could get into the hundreds of degrees
quite easily so I needed something a little more robust than the [TMP36](https://learn.adafruit.com/tmp36-temperature-sensor)
that came with my Arduino kit.  Instead I looked into [Type-K thermocouples](http://en.wikipedia.org/wiki/Thermocouple#Type_K)
as they are the sort of temperature sensor you'll find in your oven and they can
easily cope with these sorts of temperatures.  They need an amplifier to work
which sounded complicated until I found the [AD8495](http://shop.pimoroni.com/products/adafruit-analog-output-k-type-thermocouple-amplifier-ad8495-breakout)
breakout board (Adafruit to the rescue again) - you plug the thermocouple in one
end, 5v and ground into the other and you get pin you can take a analogue
reading from to get the temperature. Lovely.

I bought two thermocouples - a [glass braid one](http://shop.pimoroni.com/products/thermocouple-type-k-glass-braid-insulated-k)
for measuring the ambient smoker temperature and a [stainless steel one](http://uk.rs-online.com/web/p/thermocouples/3971286/)
for measuring the internal temperature of the meat.

## Wait, I need to keep this thing tethered to USB?

I figured to use an [Arduino](http://www.arduino.cc/) with the rather excellent
[johnny-five](https://github.com/rwaldron/johnny-five) library.  There's an
important caveat in all this - since the JavaScript code that drives the
hardware runs on a computer, the Arduino has to remain tethered to the computer
via a USB umbilical cord.

That was clearly not going to fly - I didn't really want to leave my laptop out
next to the smoker all day so I needed a better solution.

A while ago I picked up a bunch of [nRF24L01+](https://www.nordicsemi.com/eng/Products/2.4GHz-RF/nRF24L01P)
based 2.4GHz wireless transceiver modules on eBay, little low-energy cards that
talk an RF protocol similar to Bluetooth with data rates of up to 2Mbps.  They
interact with the Arduino via it's [SPI](http://en.wikipedia.org/wiki/Serial_Peripheral_Interface_Bus)
pins.

As luck would have it, someone's already provided some example code of [how to
get a nRF24L01 working with an Arduino](http://playground.arduino.cc/InterfacingWithHardware/Nrf24L01),
so the hard work had more or less been done for me.

Under the hood, johnny-five speaks the [Firmata](http://www.firmata.org/) protocol.
Anyone who's attended a [NodeBots](http://nodebots.io/) meetup will remember
firing up the Arudino IDE and loading the [StandardFirmata](https://github.com/firmata/arduino/blob/master/examples/StandardFirmata/StandardFirmata.ino)
sketch onto their board.

StandardFirmata is only one of several options, another is [ConfigurableFirmata](https://github.com/firmata/arduino/blob/configurable_dev/examples/ConfigurableFirmata/ConfigurableFirmata.ino).
This is a version of Firmata that you can use to enable and disable
functionality as required and seems to be where some of the more obscure bits
of the protocol are implemented.

One such bit is Network Firmata - e.g. receiving firmata messages using an
ethernet shield. This works because some bright spark abstracted the serial
port operations into a class named [Stream](http://arduino.cc/en/Reference/Stream).
When we enable network firmata, the [following code](https://github.com/firmata/arduino/blob/5f2ed7025bc89fb909e72e466edc111b33146844/examples/ConfigurableFirmata/ConfigurableFirmata.ino#L106)
gets executed:

```c
#ifdef NETWORK_FIRMATA
//...
#include <utility/EthernetClientStream.h>
//...
#ifdef local_ip
  EthernetClientStream stream(client,local_ip,remote_ip,NULL,remote_port);
#else
  //...
#endif
```

So we set up an `EthernetClientStream` object if `NETWORK_FIRMATA` is defined.
Later on, [this happens](https://github.com/firmata/arduino/blob/5f2ed7025bc89fb909e72e466edc111b33146844/examples/ConfigurableFirmata/ConfigurableFirmata.ino#L218):

```c
#ifdef NETWORK_FIRMATA
  //...
  Firmata.begin(stream);
#else
  Firmata.begin(57600);
#endif
```

Inside `Firmata.cpp`, those `begin` methods [look like this](https://github.com/firmata/arduino/blob/5f2ed7025bc89fb909e72e466edc111b33146844/Firmata.cpp#L67):

```c
void FirmataClass::begin(long speed)
{
  Serial.begin(speed);
  FirmataStream = &Serial;
  //...
}

void FirmataClass::begin(Stream &s)
{
  FirmataStream = &s;
  //...
}
```

If `NETWORK_FIRMATA` is defined, the stream that we created earlier gets
passed to the Firmata class and it'll use that instead of the SerialPort class.

This is great because all we need to do is implement the nRF24L01 driver as
an Arduino stream, which is in the repo as [WirelessClientStream.cpp](https://github.com/achingbrain/arduino/blob/6ff444f5091f4e59ddb1d5e2ad7d267d4ad17a4e/utility/WirelessClientStream.cpp).

Now that we can receive serial port data over wireless, we need to send it too.
I attached another Arduino to my laptop, running the following sketch:

```c
// spi pins
#define CE_PIN 8
#define CSN_PIN 7

// the wireless channel to use
#define CHANNEL 0

// our node name on the network
#define RX_ADDR "node2"

// where we will send traffic
#define TX_ADDR "node1"

#include <SPI.h>
#include <Mirf.h>
#include <nRF24L01.h>
#include <MirfHardwareSpiDriver.h>

void setup() {
  Serial.begin(57600);

  Mirf.cePin = CE_PIN;
  Mirf.csnPin = CSN_PIN;
  Mirf.spi = &MirfHardwareSpi;
  Mirf.init();

  Mirf.setRADDR((byte *)RX_ADDR);

  Mirf.channel = CHANNEL;
  Mirf.payload = sizeof(int);
  Mirf.config();
}

void loop() {
  int incoming;

  // read any incoming data
  while(Mirf.dataReady()) {
    Mirf.getData((byte *)&incoming);

    Serial.write(incoming);
  }

  // write any outgoing data
  while(Serial.available() > 0) {
    incoming = Serial.read();

    Mirf.setTADDR((byte *)TX_ADDR);
    Mirf.send((byte *)&incoming);

    while(Mirf.isSending()) {
      // do nothing while we send
    }
  }
}
```

During the loop, if there's any data available from the wireless card, it writes
it into the serial port for the computer to pick up, then if there's any data
available from the serial port, it sends it over the wireless card to the
remote Arduino.  The idea is to be completely transparent.

When wired up, the Arduino connected to the computer looks like this:

![Wireless client connected to laptop](https://raw.githubusercontent.com/achingbrain/meatmon/master/assets/client.jpg)

The johnny-five code that runs on the laptop is (as ever) almost embarrassingly
simple:

```javascript
var five = require('johnny-five'),
  temperatureSensor = require('./lib/temperatureSensor')

var board = new five.Board({port: '/dev/tty.usbserial-A603HIUN'})
board.on('ready', function() {
  // setup internal temperature monitor
  var internalTemperatureSensor = temperatureSensor(board, 3, -36)
  internalTemperatureSensor.on('temperature', function(temperature) {
    console.info('Received internal temperature %d°C', temperature);
  })

  // setup external temperature monitor
  var externalTemperatureSensor = temperatureSensor(board, 4, -36)
  externalTemperatureSensor.on('temperature', function(temperature) {
    console.info('Received external temperature %d°C', temperature);
  })
})
```

The `temperatureSensor` module is below. It reads the temperature from the
thermocouple breakout board, converts it into centigrade and emits an event
so listeners can do something useful with the recorded temperature.

```javascript
var EventEmitter = require('events').EventEmitter,
  util = require('util')

var TemperatureSensor = function(board, pin, fudgeFactor, interval) {
  EventEmitter.call(this)

  // how often to report the temperature
  interval = interval || 60000

  // turn on reporting for that pin
  board.io.reportAnalogPin(pin, 1)

  var measurements = 0
  var temporary = 0
  this._temperature = 0

  // read the temperature occasionally
  board.analogRead(pin, function(value) {
    var voltage = value * (5.0 / 1023.0);
    var temp = (voltage - 1.25) / 0.005;

    temporary += temp
    measurements++

    if(measurements == 10) {
      measurements = 0
      this._temperature = parseInt(temporary/10, 10)
      this._temperature += fudgeFactor
      temporary = 0
    }
  }.bind(this))

  setInterval(function() {
    this._emit('temperature', this._temperature)
  }.bind(this), interval)
}
util.inherits(TemperatureSensor, EventEmitter)

module.exports = function(board, pin, fudgeFactor, interval) {
  return new TemperatureSensor(board, pin, fudgeFactor, interval)
}
```

The astute reader will notice that I am explicitly turning on pin reporting
in the temperatureSensor module. This is because for a reason I cannot
comprehend [firmata.js](https://github.com/jgautier/firmata) turns pin
monitoring for all analogue pins by default. This is fine for high-speed, high
bandwidth devices/connections (like the Uno over USB) but swamps the RF
connection with unnecessary traffic.  There's a [pull request](https://github.com/jgautier/firmata/pull/58)
open around this, hopefully it'll get merged soon.  In the interim you have to
comment out [this for loop](https://github.com/jgautier/firmata/blob/c64e413076b57b272877bac4df9f08ae8bc76a2a/lib/firmata.js#L92)
in firmata.js to get it to work.

Also, `analogRead` calls the passed callback loads of times instead of just once
which was also a bit confusing.

The really astute reader will notice a variable named `fudgeFactor`. That's a,
uh, 'calibration'.  It's hardware, right?

You can see the whole setup at about halfway through the process here:

![Arduino connected to temperature sensors](https://raw.githubusercontent.com/achingbrain/meatmon/master/assets/setup.jpg)

The stainless steel sensor is inserted into the meat and the braid one is lying
next to the contingency plan - an actual meat thermometer.

From the external view:

![Lid closed, sensors in place](https://raw.githubusercontent.com/achingbrain/meatmon/master/assets/external.jpg)

## So much data

What do you do with the data?  Graph it, of course.

I ran a small webapp on my laptop that gave me a real-time(ish) readout of the
internal and external temperatures, as well as a rough estimation of when the
meat would be ready based on internal temperature and assuming a constant
increase over time (I said it was rough).

It stored the database in a local instance of [CouchDB](http://couchdb.apache.org/)
and had a [Hapi](http://hapijs.com/) driven REST API that the johnny-five
process would post info to.  It used [nano-repository](https://www.npmjs.org/package/nano-repository)
to make database access a bit more bearable and [columbo](https://www.npmjs.org/package/columbo)
for REST resource discovery.

![Meatmon](https://raw.githubusercontent.com/achingbrain/meatmon/master/assets/graph.jpg)

What's nice is you can see the temperature being way too hot to start with, me
freaking out and repeatedly opening the lid to remove coals, and when I opened
the lid towards the end and forgot to put the external sensor back in.

## The final result

I managed to get a quick snap in before the wolves descended.

![The finished article](https://raw.githubusercontent.com/achingbrain/meatmon/master/assets/omnomnom.jpg)

Not too shabby.

## Source

The changes I made to `ConfigurableFirmata` are in the `add-wireless` branch of
[achingbrain/firmata](https://github.com/achingbrain/arduino/tree/add-wireless)

You can see the johnny-five code and stat collector webapp in the
[achingbrain/meatmon](https://github.com/achingbrain/meatmon) repository.
