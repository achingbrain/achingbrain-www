meta:
  date: 2016-06-17 09:00:00
  title: Hacking an FPV Drone

Recently [Bernard](https://twitter.com/_bmordan) has been getting into drone flying and knocked up his first FPV system
so I thought I'd have a go too.

At the time I didn't own a drone, headset or transmitter - these things can be expensive and considering I would spend
most of the time crashing them into the ground I didn't want to spend too much.

After reading a few reviews I settled on the [Dromida Ominus](https://www.amazon.co.uk/Dromida-Ominus-UAV-Quadcopter-Green/dp/B00NHLALDK).  It's a clone of the more expensive LaTrax Alias - as drones go it's cheap, durable and has multiple flight
modes so you can vary the responsiveness as you become a better pilot.  With a bit of dremeling you can even
[use Alias parts to repair it](https://www.youtube.com/watch?v=1hANFkxQlhs)!

![Ominus](./img/hacking-an-fpv-drone/ominus.jpg)

It's not got a built in camera though so that would need addressing.  Most camera drones of this class are essentially
flying WiFi hotspots which you connect to with your smartphone.  WiFi video like this has a little bit of lag which is
not fantastic for drone flying, instead most FPV setups transmit video directly over 2.4GHz or 5.8GHz (e.g. the same
frequencies as WiFi) but without the overhead of a network protocol.

![Camera](./img/hacking-an-fpv-drone/camera.jpg)

I wanted a camera that was small, light & reusable so picked up a [Spektrum VA1100 Ultra Micro FPV Camera](http://www.wheelspinmodels.co.uk/i/237470/) and a matching [FatShark Attitude V3](https://www.amazon.co.uk/fatshark-Attitude-Goggles-Headset-Modular/dp/B01F2XKVI0/ref=sr_1_1?ie=UTF8&qid=1466162102&sr=8-1&keywords=fatshark+attitude+v3) headset.  The headset was by far the most expensive component of the setup but I will be able to reuse it
with any later drone setups so I see it as more of an investment for the future.  It's also fully modular so components
can be upgraded, head tracking added and it even supports 3D which would be pretty special for drone flying although
that would need a camera upgrade.

The Ominus doesn't have a separate power connector for a camera but since the camera takes 3.7v as input I can connect
it directly to the flight battery.  The camera came with a Y cable for this purpose but the connectors are tiny and
not the same as the battery connector.

![Connectors](./img/hacking-an-fpv-drone/connectors.jpg)

My solution was to cut one of the branches of the Y cable, strip the ends and
solder it directly to the battery terminal on the flight PCB.

Exposing the FPV is just a case of loosening this screw and the same one on the opposite side:

![Screw](./img/hacking-an-fpv-drone/screw.jpg)

Then solder the wires to the top side of the PCB.  The battery connects to the underside so there's plenty of space. I
also put a bit of hot glue over the solder joints to protect them.

![Battery](./img/hacking-an-fpv-drone/battery.jpg)

Finally connect the camera and mount it to the top of the drone.  I've just used blu-tac for this because I wanted to be
able to adjust the positioning and also if (when) I crash it, the camera just pops off the top instead of the relatively
fragile antenna taking the brunt of the blow.

![Drone](./img/hacking-an-fpv-drone/drone.jpg)

The only other thing that surprised me was that although the headset battery say 'Charge with provided charger only' no
charger was actually provided which seems like a bit of a swizz considering how much it costs.  A quick trip to Amazon
had a [Keenstone K6AC+ charger](https://www.amazon.co.uk/UPGRADED-Keenstone®-Universal-Discharger-Powerful/dp/B015DKGZK0)
on my desk 24 hours later, which seems to work, although I had to lower the maximum output power from 8A to 1A as it was
overloading the battery.

Here are Bernard and I at the inaugural meeting of the South London Drone Racing Society flying over Peckham Rye:

<iframe width="640" height="360" src="https://www.youtube.com/embed/aOJb2tB2iAU" frameborder="0" allowfullscreen></iframe>

I only managed to put my drone in a tree once!
