meta:
  date: 2015-04-04 15:00:00
  title: Giant LCD Clock
  subtitle: Building a(nother) giant LCD clock

When [@olizilla](https://twitter.com/olizilla), [@_alanshaw](https://twitter.com/_alanshaw) and I assume our ultimate form, it is that of [NodeBots of London](http://www.meetup.com/NodeBots-of-London). This year we're running a series of events we've called the [NodeBots Battle Royale](http://london.nodebots.io).  In a nutshell everyone turns up at 10am on a Saturday and is issued with a challenge and a reference kit.  People have access to tools, spare parts and are encouraged to use their creativity to customise their kit in order to best their rivals when the competition starts at about 3:30.

When we started the meetup, our aim was essentially to get good at electronics so we can build a Jaeger and we've been working towards that goal ever since.

![Jaeger](./img/giant-lcd-clock/jaeger.jpg)

I figured what we needed was a [giant countdown clock](http://pacificrim.wikia.com/wiki/War_Clock) that would show the time remaining until the competition started (although counting down instead of up).

Inspired by the wonderful [12ft GPS Wall Clock](https://www.sparkfun.com/tutorials/47) on Sparkfun's website I started to build my own.

![War clock](./img/giant-lcd-clock/clock.jpg)

The GPS clock used [12v light bars](https://www.sparkfun.com/products/12015) of type you get in kitchen lighting; with fourteen bars per numeral, two for each segment.  The lights are one colour and the whole bar is either on of off.  RJ45 cable and custom circuit boards were used to wire it all together.

I've never been very good at making ethernet cable (and consequently have some unreliable cabling under my floorboards) and I didn't fancy making custom circuit boards - rather I wanted to run the whole thing from an Arduino or Raspberry Pi; neither or which can supply 12v without extra circuitry, so I needed to find a different solution.

The answer comes in the form of [WS2812 LEDs](http://www.tweaking4all.com/hardware/arduino/arduino-ws2812-led), also known as "[NeoPixels](http://www.adafruit.com/category/168)".  UK supplier Proto-Pic sells [strips of these](http://proto-pic.co.uk/led-rgb-strip-addressable-bare-5m) up to 5m in length - they run at 5v and since each LED has a chip embedded in it they are individually addressable - meaning it only takes three wires to run hundreds of them - they are even RGB LEDs to boot.

An important safety tip - wear googles and a mask.  There will be little bits of stuff flying around everywhere and you don't want that stuff in your eyes or sinuses.  Make sure your mask fits better than mine...

![Saftey First](./img/giant-lcd-clock/safteyfirst.jpg)

The first thing to do was to create a template for the numbers.  Wickes sell [3mm hardboard at 607mm x 1220mm](http://www.wickes.co.uk/Wickes-General-Purpose-Hardboard-3x607x1220mm/p/110105) - this would form the base for the frames so to avoid more cutting than was necessary I enlarged the image from the GPS clock page to fit that comfortably, printed it out and stenciled it onto some foamex.

![Template](./img/giant-lcd-clock/template.jpg)

I used a Dremel and a Stanley knife to cut the template out.  The multipurpose [ cutting wheel](http://www.amazon.co.uk/dp/B00004UDGX) generates a lot of friction - the vented [wood cutting wheel](http://www.amazon.co.uk/dp/B001DHCY9E) tears material away from the thing you are cutting so I find it works better with things that are likely to melt like perspex and indeed, foamex.

![Cutting](./img/giant-lcd-clock/cuttingtemplate.jpg)

Next up was cutting the polystyrene.  This made an incredible amount of mess.  I tried with a circular saw, the Dremel wood cutting blades, even some [third party serrated blades](http://www.amazon.co.uk/dp/B004ANKR9M), all of which statically charged the polystyrene so it stuck to every available nearby surface.

![Workbench](./img/giant-lcd-clock/workbench.jpg)

What I discovered a little too late was that a very (very) sharp kitchen knife actually works really well and doesn't create nearly as much mess.

![Knife](./img/giant-lcd-clock/knife.jpg)

The finished blocks:

![Polystyrene](./img/giant-lcd-clock/polystyrene.jpg)

They were cut from [25mm insulation boards](http://www.wickes.co.uk/Wickes-25mm-General-Purpose-Polystyrene-600x2400mm/p/210801).  For some reason they have little black flecks all the way through them - not a problem when they are in your attic but it does spoil the aesthetic slightly for a clock.  A few coats of water based white emulsion sorted that out though.

![Painted polystyrene](./img/giant-lcd-clock/paintedpolystyrene.jpg)

The soldering begins.  Note the frames made from pine stripwood - the kind of stuff you make door jambs from - I chose 15mm x 25mm x 2400mm sticks.

Each LED was cut out from the strip individually and hot-glued onto the hardboard.

![Soldering](./img/giant-lcd-clock/soldering.jpg)

Each LED had six solder joints and each numeral had 42 LEDs.  That's a lot of soldering.  Thankfully the colons only had 8 LEDs each.

![More soldering](./img/giant-lcd-clock/moresoldering.jpg)

A finished numeral:

![Without Polystyrene](./img/giant-lcd-clock/withoutpolystyrene.jpg)

And with the polystyrene block:

![With Polystyrene](./img/giant-lcd-clock/withpolystyrene.jpg)

I fitted a [perspex sheet](http://www.wickes.co.uk/Wickes-Durable-Acrylic-Sheet-60cmx1-22m/p/210001) to the front along with some [frosted plastic](http://www.diy.com/departments/d-c-fix-milky-frosted-effect-sticky-back-plastic-coverage-135m/192284_BQ.prd) to diffuse the LED light a bit.

Acrylic glass, the protective film says.  Uhuh.  Acrylic acrylic, they meant.

![Window](./img/giant-lcd-clock/window.jpg)

Wider but much thinner stripboard was screwed into place to hold the polystyrene and perspex in.  This was 3mm x 25mm x 2400m

![Frames](./img/giant-lcd-clock/frames.jpg)

The perspex was masked off for spray-painting.  I would have used ordinary gloss paint here but with the next NodeBots meetup looming I was running out of time so spray gloss it was.

![Wood frames](./img/giant-lcd-clock/woodframes.jpg)

All stacked up for drying:

![White Frames](./img/giant-lcd-clock/whiteframes.jpg)

The whole show is run from a Raspberry Pi B using node.js and the rather excellent [rpi-ws281x-native](https://www.npmjs.com/package/rpi-ws281x-native) module.  At the moment it only works with the original B and B+ Pis, sadly not rev2 as it relies on the timing of the PWM hardware which seems to have changed with the updated model.

There was a small amount of weirdness in that the module requires a `Uint32Array` to be passed to it with the pixel data - in recent versions of v8 (e.g. node 0.12, io.js) if you create a `Uint32Array` with length 16 or less you get something back that is not a `Uint32Array`.  See the [raspberry-node/node-rpi-ws281x-native#6](https://github.com/raspberry-node/node-rpi-ws281x-native/issues/6) for further discussion.

Power is provided by a [5v 10a laptop style adapter](http://www.syncrolight.co.uk/ProductDetails/PS-5V-DC-10A-LT.aspx).  With every LED showing white, the clock has the capability of drawing about 16 amps, but that's not how I'm planning on using it.

The chips on the strip that control the LEDs are very sensitive to timing, so the library uses the PWM pin of the Pi to signal them.  The Pi outputs 3.3v on it's GPIO pins but the lights require 5v - initially I had this going through a [logic level converter](https://www.sparkfun.com/products/12009) and it worked ok for a few lights but with all the LEDs chained together after a while the signal got corrupted and it started to look something like the [writing from The Predator](https://crashlanden.files.wordpress.com/2010/07/predator-52.png).

The solution was found in the [Adafruit NeoPixel/Raspberry Pi guide](https://learn.adafruit.com/neopixels-on-raspberry-pi/overview).  They recommend using a 74AHCT125 level converter chip - I couldn't find any of these, instead I used a [74HCT125N](http://uk.farnell.com/nxp/74hct125n/ic-74hct-cmos-74hct125-dip14-5v/dp/381998) as mentioned in the rpi-ws281x-native module README and it worked a treat.

To make it a bit more robust I mounted the chip on a [Pi Plate](https://www.coolcomponents.co.uk/raspberry-pi-proto-plate.html) with the cabling underneath to make it look tidy and it's all set.

![Raspberry Pi](./img/giant-lcd-clock/raspberrypi.jpg)

Because the lights are all RGB LEDs and they are individually addressable it's got a neat demo mode.  Here the frames are unassembled.  This was taken at about 3:30am on the morning of NodeBots.  Phew.

![Colourful](./img/giant-lcd-clock/colourful.jpg)

Installed at NodeBots (sadly it wasn't possible to wall mount it).  As events transpired the soldering was so time consuming that I ended up spraying the frames after NodeBots, but I'd already bought the paint by then so meh.

![In situ](./img/giant-lcd-clock/insitu.jpg)

The finished article.  At nearly 3.5m long it's slightly smaller than the GPS clock but it's still too big for my kitchen!

![Finished](./img/giant-lcd-clock/finished.jpg)

And that's it!

If I could have my time again, I'd probably try to find pre-made RGB LEG bars or strips with wider spacing that would obviate the need for quite so much soldering.

Also the connectors between the numerals are just [3x1 crimp connectors](http://proto-pic.co.uk/0-1-2-54mm-crimp-connector-housing-1x3-pin-25-pack) and feel a bit flimsy, they should probably be something more robust.  I fancy trying to find some 3-pin mini jacks like the sort you get with mobile phone handsfree kits, but for the moment I'm just happy I don't have to solder anything for a while.

You can still see the individual LEDs which is a shame.  Pre-frosted plexiglas might be a reasonable solution to this although it might get expensive.  Other options are a dab of hot glue over each LED to diffuse the light further and maybe another sheet of privacy film.

The code that runs the clock is up on GitHub: https://github.com/achingbrain/clockbot
