barnowl-enocean
===============

__barnowl-enocean__ converts ambient EnOcean Wireless Standard packets collected from EnOcean Serial Protocol (ESP) devices into standard developer-friendly JSON that is vendor/technology/application-agnostic.

![Overview of barnowl-enocean](https://reelyactive.github.io/barnowl-enocean/images/overview.png)

__barnowl-enocean__ is a lightweight [Node.js package](https://www.npmjs.com/package/barnowl-enocean) that can run on resource-constrained edge devices.  It is typically run behind a [barnowl](https://github.com/reelyactive/barnowl) instance which is included in the [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source middleware suite.


Getting Started
---------------

Learn "owl" about the __raddec__ JSON data output:
-  [reelyActive Developer's Cheatsheet](https://reelyactive.github.io/diy/cheatsheet/)


Quick Start
-----------

Clone this repository, install package dependencies with `npm install`, and then from the root folder run at any time:

    npm start

__barnowl-enocean__ will attempt to connect to an EnOcean Serial Protocol device (ex: USB dongle) and output (flattened) __raddec__ JSON to the console.


Hello barnowl-enocean!
----------------------

The following code will listen to _simulated_ hardware and output packets to the console:

```javascript
const BarnowlEnOcean = require('barnowl-enocean');

let barnowl = new BarnowlEnOcean();

barnowl.addListener(BarnowlEnOcean.TestListener, {});

barnowl.on("raddec", function(raddec) {
  console.log(raddec);
});

barnowl.on("infrastructureMessage", function(message) {
  console.log(message);
});
```

As output you should see a stream of [raddec](https://github.com/reelyactive/raddec/) objects similar to the following:

```javascript
{
  transmitterId: "04141559",
  transmitterIdType: 7,
  rssiSignature: [
    {
      receiverId: "38bdfde8b5e5415a830551bda6484c23",
      receiverIdType: 6,
      rssi: -58,
      numberOfDecodings: 1
    }
  ],
  packets: [ '55000f07012bd295db00b163e0f85800041415598001ffffffff3b0047' ],
  timestamp: 1645568542222
}
```

Regardless of the underlying RF protocol and hardware, the [raddec](https://github.com/reelyactive/raddec/) specifies _what_ (transmitterId) is _where_ (receiverId & rssi), as well as _how_ (packets) and _when_ (timestamp).


Identifiers and Packet Formats
------------------------------

The `receiverId` is a 128-bit UUID, which, as of v1.0.0, is generated on a per-session basis.  In future versions, this UUID may remain persistent across sessions for a specific USB dongle.

Each `packets` entry is an EnOcean Serial Protocol 3 (ESP3) packet (from Sync byte to CRC8D, inclusive).


Supported Listener Interfaces
-----------------------------

The following listener interfaces are supported.

### Serial

Listen on a local serial interface to an EnOcean Serial Protocol (ESP) device.  Check the [serialport](https://serialport.io/docs/guide-installation) package for prerequisites specific to the target platform if any problems are encountered.

```javascript
barnowl.addListener(BarnowlEnOcean.SerialListener, { path: "auto" });
```

On Ubuntu, it may be necessary to add the user to the _dialout_ group in order to have the necessary permissions to access the device, which can be accomplished with the command ```sudo usermod -a -G dialout $USER``` and made to take effect by logging out and back in to the user account.

### Test

Provides a steady stream of simulated packets for testing purposes.

```javascript
barnowl.addListener(BarnowlEnOcean.TestListener, {});
```


Is that owl you can do?
-----------------------

While __barnowl-enocean__ may suffice standalone for simple real-time applications, its functionality can be greatly extended with the following software packages:
- [advlib](https://github.com/reelyactive/advlib) to decode the individual packets from hexadecimal strings into JSON
- [barnowl](https://github.com/reelyactive/barnowl) to combine parallel streams of RF decoding data in a technology-and-vendor-agnostic way

These packages and more are bundled together as the [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere) open source middleware suite, which includes several __barnowl-x__ listeners.


Pareto Anywhere Integration
---------------------------

__barnowl-enocean__ includes a script to forward data to a local [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) instance as UDP raddecs with target localhost:50001.  Start this script with the command:

    npm run forwarder

Install __Pareto Anywhere__ _and_ __barnowl-enocean__ by following a step-by-step tutorial on our [reelyActive Developers](https://reelyactive.github.io/) site:
- [Run Pareto Anywhere on a PC](https://reelyactive.github.io/diy/pareto-anywhere-pc/)
- [Run Pareto Anywhere on a Pi](https://reelyactive.github.io/diy/pareto-anywhere-pi/)


Project History
---------------

__barnowl-enocean__ v1.0.0 was released in January 2024, superseding all earlier versions, the latest of which remains in the [release-0.3 branch](https://github.com/reelyactive/barnowl-enocean/tree/release-0.3) and as [barnowl-enocean@0.3.1 on npm](https://www.npmjs.com/package/barnowl-enocean/v/0.3.1).


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.


License
-------

MIT License

Copyright (c) 2022-2024 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
