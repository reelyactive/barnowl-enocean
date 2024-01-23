/**
 * Copyright reelyActive 2022-2024
 * We believe in an open Internet of Things
 */


const crypto = require('crypto');


/**
 * ESPPacketQueue Class
 * Convenience class for hexadecimal string queue of ESP packets.
 */
class ESPPacketQueue {

  /**
   * ESPPacketQueue constructor
   * @constructor
   */
  constructor(data) {
    this.data = data || '';
    this.uuid = crypto.randomUUID();
  }

  /**
   * Add data to the queue.
   * @param {String} data The hexadecimal string to add.
   */
  addData(data) {
    this.data += data;
  }

  /**
   * Slice the data at the given index.
   * @param {Number} index The index from which to slice the data.
   */
  sliceAtIndex(index) {
    this.data = this.data.slice(index);
  }

  /**
   * Determine the index after the given string, if present.
   * @param {String} string The string to look for.
   * @param {boolean} acceptExtension Check and accept if string is extended?
   * @return {Number} The index following the given string if present, else -1.
   */
  indexAfter(string, acceptExtension) {
    let index = this.data.indexOf(string);
    if(index < 0) {
      return -1;
    }
    index += string.length;

    if(acceptExtension === true) {
      while(this.data.substr(index + 2).indexOf(string) === 0) {
        index += 2;
      }
    }  

    return index;  
  }
}


module.exports = ESPPacketQueue;
