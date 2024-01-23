/**
 * Copyright reelyActive 2022-2024
 * We believe in an open Internet of Things
 */


const ESPPacket = require('./esppacket');
const advlib = require('advlib-identifier');
const Raddec = require('raddec');


const CRC_TABLE = [
	  0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b, 0x12, 0x15,
	  0x38, 0x3f, 0x36, 0x31, 0x24, 0x23, 0x2a, 0x2d,
	  0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65,
	  0x48, 0x4f, 0x46, 0x41, 0x54, 0x53, 0x5a, 0x5d,
	  0xe0, 0xe7, 0xee, 0xe9, 0xfc, 0xfb, 0xf2, 0xf5,
	  0xd8, 0xdf, 0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd,
	  0x90, 0x97, 0x9e, 0x99, 0x8c, 0x8b, 0x82, 0x85,
	  0xa8, 0xaf, 0xa6, 0xa1, 0xb4, 0xb3, 0xba, 0xbd,
	  0xc7, 0xc0, 0xc9, 0xce, 0xdb, 0xdc, 0xd5, 0xd2,
	  0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4, 0xed, 0xea,
	  0xb7, 0xb0, 0xb9, 0xbe, 0xab, 0xac, 0xa5, 0xa2,
	  0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a,
	  0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32,
	  0x1f, 0x18, 0x11, 0x16, 0x03, 0x04, 0x0d, 0x0a,
	  0x57, 0x50, 0x59, 0x5e, 0x4b, 0x4c, 0x45, 0x42,
	  0x6f, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7d, 0x7a,
	  0x89, 0x8e, 0x87, 0x80, 0x95, 0x92, 0x9b, 0x9c,
	  0xb1, 0xb6, 0xbf, 0xb8, 0xad, 0xaa, 0xa3, 0xa4,
	  0xf9, 0xfe, 0xf7, 0xf0, 0xe5, 0xe2, 0xeb, 0xec,
	  0xc1, 0xc6, 0xcf, 0xc8, 0xdd, 0xda, 0xd3, 0xd4,
	  0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c,
	  0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a, 0x43, 0x44,
	  0x19, 0x1e, 0x17, 0x10, 0x05, 0x02, 0x0b, 0x0c,
	  0x21, 0x26, 0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34,
	  0x4e, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5c, 0x5b,
	  0x76, 0x71, 0x78, 0x7f, 0x6A, 0x6d, 0x64, 0x63,
	  0x3e, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2c, 0x2b,
	  0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d, 0x14, 0x13,
	  0xae, 0xa9, 0xa0, 0xa7, 0xb2, 0xb5, 0xbc, 0xbb,
	  0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8D, 0x84, 0x83,
	  0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb,
	  0xe6, 0xe1, 0xe8, 0xef, 0xfa, 0xfd, 0xf4, 0xf3
];


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
 * Calculate the expected CRC based on the given hexadecimal string.
 * @param {String} data The data on which to calculate the CRC.
 * @return {Number} The expected CRC.
 */
function calculateCRC(data) {
	let crc = 0;

	for(let cByte = 0; cByte < (data.length / 2); cByte++) {
		crc = CRC_TABLE[(crc ^ toInt(data, cByte, 1))];
	}

	return crc;
}


/**
 * Decode a Radio ERP1 packet.
 * @param {String} packet The entire ESP packet as a hexadecimal string.
 * @param {String} data The data as a hexadecimal string.
 * @param {String} optionalData The optional data as a hexadecimal string.
 * @param {Number} lengthBytes Length of the packet in bytes.
 * @param {String} origin Origin of the data stream.
 * @param {Number} time The time of the data capture.
 * @param {String} receiverId The receiver identifier as a hexadecimal string.
 * @param {Number} receiverIdType The receiver identifier type.
 * @param {Object} options The packet decoding options.
 */
function decodeRadioERP1(packet, data, optionalData, lengthBytes, origin, time,
                         receiverId, receiverIdType, options) {
  let choice = toInt(data, 0, 1);
  let rssi = 0 - toInt(optionalData, 5, 1);
  let transmitterId = toHexString(data, (data.length / 2) - 5, 4);
  let raddec = new Raddec({ 
      transmitterId: transmitterId,
      transmitterIdType: Raddec.identifiers.TYPE_EURID32
  });
  raddec.addDecoding({
      receiverId: receiverId,
      receiverIdType: receiverIdType,
      rssi: rssi
  });
  raddec.addPacket(packet);

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
  let isTooShort = ((queue.data.length - indexOfPacket + 2) <
                    (ESPPacket.MIN_PACKET_LENGTH_BYTES * 2));

  if(isTooShort) {
    return new ESPPacket(null, { isIncomplete: true }, 0, origin, time);
  }
  else {
    let header = queue.data.substring(indexOfPacket, indexOfPacket + 8);
    let dataLength = toInt(header, 0, 2);
    let optionalLength = toInt(header, 2, 1);
    let packetType = toInt(header, 3, 1);

    isTooShort = ((queue.data.length - indexOfPacket + 2) <
                  ((ESPPacket.MIN_PACKET_LENGTH_BYTES + (dataLength - 1) +
                                                        optionalLength) * 2));

    if(isTooShort) {
      return new ESPPacket(null, { isIncomplete: true }, 0, origin, time);
    }

    let indexOfData = indexOfPacket + 10;
    let indexOfOptionalData = indexOfData + (dataLength * 2);
    let indexOfCRC8D = indexOfOptionalData + (optionalLength * 2);
    let lengthBytes = (indexOfCRC8D + 2 - indexOfPacket) / 2;
    let crc8h = toInt(queue.data, (indexOfPacket + 8) / 2, 1);
    let crc8d = toInt(queue.data, indexOfCRC8D / 2, 1);
    let packet = queue.data.substring(indexOfPacket - 2, indexOfCRC8D + 2);
    let data = queue.data.substring(indexOfData, indexOfOptionalData);
    let optionalData = queue.data.substring(indexOfOptionalData, indexOfCRC8D);

    if((crc8h !== calculateCRC(header)) ||
       (crc8d !== calculateCRC(data + optionalData))) {
      return new ESPPacket(null, {}, 0, origin, time); // CRC fail
    }

    switch(packetType) {
      case ESPPacket.TYPE_ERP1:
        return decodeRadioERP1(packet, data, optionalData, lengthBytes, origin,
                               time, queue.uuid,
                               Raddec.identifiers.TYPE_UUID128, options);
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
