const process = require('process')
const fs = require('fs')
const { encodeObject, decodeObject, Multiplexer } = require('omnistreams')
const { ReadStreamAdapter, UnbufferedWriteStreamAdapter } = require('omnistreams-node-adapter')
const { BufferConduit } = require('omnistreams-conduit')

const fileReadStream = fs.createReadStream('in.bam')
const fileWriteStream = fs.createWriteStream('out.bam')

const producer = new ReadStreamAdapter({
  nodeStream: fileReadStream,
  bufferSize: 10,
})

const buffer = new BufferConduit(100)
const consumer = new UnbufferedWriteStreamAdapter(fileWriteStream)

producer.pipe(buffer)
buffer.pipe(consumer)
