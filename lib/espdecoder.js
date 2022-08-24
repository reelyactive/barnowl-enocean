/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const espPacketDecoder = require('./esppacketdecoder');
const ESPPacketQueue = require('./esppacketqueue');


/**
 * ESPDecoder Class
 * Decodes data streams from one or more EnOcean Serial Protocol devices and
 * forwards the packets to the given ReelManager instance.
 */
class ESPDecoder {

  /**
   * ESPDecoder constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.barnowl = options.barnowl;
    this.queuesByOrigin = {};
  }

  /**
   * Handle data from a given device, specified by the origin
   * @param {String} data The reel data as a hexadecimal string.
   * @param {String} origin The unique origin identifier of the device.
   * @param {Number} time The time of the data capture.
   * @param {Object} decodingOptions The packet decoding options.
   */
  handleData(data, origin, time, decodingOptions) {
    let self = this;
    let isNewOrigin = (!this.queuesByOrigin.hasOwnProperty(origin));
    if(isNewOrigin) {
      this.queuesByOrigin[origin] = new ESPPacketQueue(data);
    }
    else {
      this.queuesByOrigin[origin].addData(data);
    }
    let packets = espPacketDecoder.decode(this.queuesByOrigin[origin],
                                          origin, time, decodingOptions);
    packets.forEach(function(packet) {
      if(packet.hasOwnProperty('raddec')) {
        self.barnowl.handleRaddec(packet.raddec);
      }
    });
  }
}


module.exports = ESPDecoder;
