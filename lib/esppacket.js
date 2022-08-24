/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */

// Constants (Prefix)
const PREFIX = '55';

// Constants (Packet)
const MIN_PACKET_LENGTH_BYTES = 6;

// Constants (Type)
const TYPE_UNDEFINED = 'undefined';


/**
 * ESPPacket Class
 * Represents an EnOcean Serial Protocol packet
 */
class ESPPacket {

  /**
   * ESPPacket constructor
   * @param {String} type Type of ESP packet.
   * @param {Object} content Content of the given packet type.
   * @param {Number} lengthBytes Length of the packet in bytes.
   * @param {Object} origin Origin of the data stream.
   * @param {String} time The time of the data capture.
   * @constructor
   */
  constructor(type, content, lengthBytes, origin, time) {
    content = content || {};

    this.type = type || TYPE_UNDEFINED; // TODO: known types
    this.lengthBytes = lengthBytes;

    this.isIncomplete = content.isIncomplete || false;
    this.origin = origin;
    this.time = time;

    if(content.hasOwnProperty('raddec')) {
      this.raddec = content.raddec;
    }
  }

}


module.exports = ESPPacket;
module.exports.PREFIX = PREFIX;
module.exports.MIN_PACKET_LENGTH_BYTES = MIN_PACKET_LENGTH_BYTES;
module.exports.TYPE_UNDEFINED = TYPE_UNDEFINED;
