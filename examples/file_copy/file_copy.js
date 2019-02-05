const process = require('process')
const fs = require('fs')
const { encodeObject, decodeObject, Multiplexer } = require('omnistreams')
const { ReadStreamAdapter, WriteStreamAdapter } = require('omnistreams-node-adapter')
const { MapConduit, Splitter } = require('omnistreams-conduit')

//const fileReadStream = fs.createReadStream('in.bam')
//const fileWriteStream1 = fs.createWriteStream('out1.bam')
//const fileWriteStream2 = fs.createWriteStream('out2.bam')
//
//const producer = new ReadStreamAdapter({
//  nodeStream: fileReadStream,
//  bufferSize: 10,
//})
//const consumer1 = new WriteStreamAdapter({ nodeStream: fileWriteStream1, bufferSize: 10 })
//consumer1.onFinish(() => {
//})
//const consumer2 = new WriteStreamAdapter({ nodeStream: fileWriteStream2, bufferSize: 10 })
//consumer2.onFinish(() => {
//})
//const splitter = new Splitter({ producer, consumer1, consumer2 })
//
//producer.pipe(splitter)

const conduit = new MapConduit((data) => data.val*data.val)

conduit.setEncodeFunc(encodeObject)
conduit.setDecodeFunc(decodeObject)

let index = 0
const messages = [
  { val: 1 },
  { val: 2 },
  { val: 3 },
  { val: 4 },
  { val: 5 },
  { val: 6 },
  { val: 7 },
]


conduit.onRequest((numElements) => {
  if (index < messages.length) {
    conduit.write(messages[index++])
    conduit.request(1)
  }
})

conduit.onData((data) => {
  console.log(data)
})

conduit.request(1)

//
//producer.onData((data) => {
//  fileWriteStream.write(data)
//  producer.request(1)
//})
//
//producer.onEnd(() => {
//  console.log("end")
//  fileWriteStream.close()
//})
//
//producer.request(1)


//fileReadStream.on('data', (data) => {
//  consumer.write(new Uint8Array(data))
//})
//
//fileReadStream.on('end', () => {
//  consumer.end()
//})
//
//let requested = 0
//consumer.onRequest((numElements) => {
//  requested += numElements
//})
//
//consumer.onFinish(() => {
//  console.log("Requested: " + requested)
//})

