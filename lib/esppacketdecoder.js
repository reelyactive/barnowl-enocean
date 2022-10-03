/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const ESPPacket = require('./esppacket');
const advlib = require('advlib-identifier');
const Raddec = require('raddec');


/**
 * Convert a chunk of hexadecimal string into an integer.
 * @param {String} string The hexadecimal string from which to read.
 * @param {Number} start Index of the first byte.
 * @param {Number} length Number of bytes to read.
 */
function toInt(string, start, length) {
  return parseInt(string.substr(start * 2, length * 2), 16);
}


/**
 * Grab a chunk of hexadecimal string.
 * @param {String} string The hexadecimal string from which to read.
 * @param {Number} start Index of the first byte.
 * @param {Number} length Number of bytes to read.
 */
function toHexString(string, start, length) {
  return string.substr(start * 2, length * 2);
}


/**
 * Determine if the header is valid based on the CRC8H.
 * @param {ESPPacketQueue} queue The queue of packets as hexadecimal strings.
 * @param {Number} indexOfHeader Index of the start of header in the string.
 */
function isValidHeader(queue, indexOfHeader) {
  return true;
}


/**
 * Decode a Radio ERP1 packet.
 * @param {String} data The data as a hexadecimal string.
 * @param {String} optionalData The optional data as a hexadecimal string.
 * @param {Number} lengthBytes Length of the packet in bytes.
 * @param {String} origin Origin of the data stream.
 * @param {Number} time The time of the data capture.
 * @param {Object} options The packet decoding options.
 */
function decodeRadioERP1(data, optionalData, lengthBytes, origin, time,
                         options) {
  let choice = toInt(data, 0, 1);
  let rssi = 0 - toInt(optionalData, 5, 1);
  let transmitterId = toHexString(data, (data.length / 2) - 6, 4);
  let raddec = new Raddec({ 
      transmitterId: transmitterId,
      transmitterIdType: Raddec.identifiers.TYPE_EURID32
  });
  raddec.addDecoding({
      receiverId: null,
      receiverIdType: Raddec.identifiers.TYPE_UNKNOWN,
      rssi: rssi
  });
  raddec.addPacket(data);

  switch(choice) {
    default:
      return new ESPPacket(0x01, { raddec: raddec }, lengthBytes, origin, time);
  }
}


/**
 * Decode an ESP packet stripped of prefix from the given hexadecimal string.
 * @param {ESPPacketQueue} queue The queue of packets as hexadecimal strings.
 * @param {String} origin Origin of the data stream.
 * @param {String} time The time of the data capture.
 * @param {Number} indexOfPacket Index of the start of packet in the string.
 * @param {Object} options The packet decoding options.
 */
function decodeESPPacket(queue, origin, time, indexOfPacket, options) {
  let isTooShort = ((queue.data.length - indexOfPacket) <
                    (ESPPacket.MIN_PACKET_LENGTH_BYTES * 2));

  if(isTooShort) {
    return new ESPPacket(null, { isIncomplete: true }, 0, origin, time);
  }
  else {
    let header = queue.data.substring(indexOfPacket, indexOfPacket + 8);
    let dataLength = toInt(header, 0, 2);
    let optionalLength = toInt(header, 2, 1);
    let packetType = toInt(header, 3, 1);
    let crc8h = queue.data.substring(indexOfPacket + 8, indexOfPacket + 10);

    // TODO: check CRC8H to see if valid header

    let indexOfData = indexOfPacket + 10;
    let indexOfOptionalData = indexOfData + (dataLength * 2);
    let indexOfCRC8D = indexOfOptionalData + (optionalLength * 2);
    let lengthBytes = (indexOfCRC8D + 2 - indexOfPacket) / 2;

    // TODO: check CRC8D to see if valid data

    let data = queue.data.substring(indexOfData, indexOfOptionalData);
    let optionalData = queue.data.substring(indexOfOptionalData, indexOfCRC8D);

    switch(packetType) {
      case 0x01:
        // TODO: decode
        return decodeRadioERP1(data, optionalData, lengthBytes, origin, time,
                               options);
      default:
        return new ESPPacket(packetType, {}, lengthBytes, origin, time);
    } 
  }
}


/**
 * Decode all the ESP packets from the hexadecimal string.
 * @param {ESPPacketQueue} queue The queue of packets as hexadecimal strings.
 * @param {String} origin Origin of the data stream.
 * @param {Number} time The time of the data capture.
 * @param {Object} options The packet decoding options.
 */
function decode(queue, origin, time, options) {
  let packets = [];
  let prefix = ESPPacket.PREFIX;
  let indexOfPacket = queue.indexAfter(prefix);
  let isPrefixPresent = (indexOfPacket >= 0);

  while(isPrefixPresent) {
    let packet = decodeESPPacket(queue, origin, time, indexOfPacket, options);

    // Too short, wait for more data
    if(packet.isIncomplete === true) {
      return packets;
    }

    // Recognised and complete packet, add to packets
    if(packet.type !== ESPPacket.TYPE_UNDEFINED) {
      let indexOfPacketEnd = indexOfPacket + (packet.lengthBytes * 2);
      queue.sliceAtIndex(indexOfPacketEnd);
      packets.push(packet);
    }

    // Undecodable packet, ignore and slice to look for next prefix
    else {
      queue.sliceAtIndex(indexOfPacket);
    }

    indexOfPacket = queue.indexAfter(prefix);
    isPrefixPresent = (indexOfPacket >= 0);
  }

  return packets;
}


module.exports.decode = decode;
