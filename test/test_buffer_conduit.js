const { expect } = require('chai')
const { BufferConduit } = require('../')

describe('BufferConduit', function() {
  it('has a constructor', function() {
    new BufferConduit()
  })

  it('initial demand equals buffer size', function(done) {
    const buf = new BufferConduit(10)
    const data = new Uint8Array(100).fill(24)

    this.timeout(10)

    buf.onRequest((numElements) => {
      expect(numElements).to.equal(10)
      done()
    })
  })

  it('initial demand equals buffer size minus current buffered length', function(done) {
    const buf = new BufferConduit(10)
    const data = new Uint8Array(100).fill(24)

    this.timeout(10)

    buf.write(new Uint8Array(1))

    buf.onRequest((numElements) => {
      expect(numElements).to.equal(9)
      done()
    })
  })

  it('can write initial buffer worth', function() {
    const buf = new BufferConduit(10)
    for (let i = 0; i < 10; i++) {
      buf.write(new Uint8Array({}))
    }
  })

  it('writing more than buffer fails', function() {
    const buf = new BufferConduit(1)
    buf.write(new Uint8Array({}))
    expect(() => {
      buf.write(new Uint8Array({}))
    }).to.throw("BufferConduit: Attempt to write more than requested")
  })

  it('can only write bufferSize + requested', function() {
    const buf = new BufferConduit(3)
    buf.request(2)
    buf.write(new Uint8Array(1))
    buf.write(new Uint8Array(1))
    buf.write(new Uint8Array(1))
    buf.write(new Uint8Array(1))
    buf.write(new Uint8Array(1))
    expect(() => {
      buf.write(new Uint8Array(1))
    }).to.throw("BufferConduit: Attempt to write more than requested")
  })

  it("only emits request when not buffering", function() {
    const buf = new BufferConduit(3)

    let numRequested = 0
    buf.onRequest((numItems) => {
      numRequested += numItems
    })

    buf.write(new Uint8Array(1))
    buf.write(new Uint8Array(1))
    buf.write(new Uint8Array(1))

    expect(numRequested).to.equal(3)
  })
  
  it('passes data through', function() {
    const buf = new BufferConduit(3)
    const expected = [
      new Uint8Array([1,2,3]),
      new Uint8Array([4,5,6]),
      new Uint8Array([7,8,9]),
    ]

    const observed = []
    buf.onData((data) => {
      observed.push(data)
    })

    buf.request(3)

    buf.write(new Uint8Array([1,2,3]))
    buf.write(new Uint8Array([4,5,6]))
    buf.write(new Uint8Array([7,8,9]))

    expect(observed).to.eql(expected)
  })

  describe("end", function() {

    it('can be ended', function(done) {
      this.timeout(10)
      const buf = new BufferConduit(1)

      buf.onEnd(() => {
        done()
      })

      buf.end()
    })

    it("doens't end until data flush", function() {
      const buf = new BufferConduit(1)

      let endCalled = false
      buf.onEnd(() => {
        endCalled = true
      })

      buf.write(new Uint8Array([1,2,3]))
      buf.end()

      expect(endCalled).to.equal(false)

      buf.request(1)

      expect(endCalled).to.equal(true)
    })
  })

  it('can be terminated', function(done) {
    this.timeout(10)
    const buf = new BufferConduit(1)

    buf.onTermination(() => {
      done()
    })

    buf.terminate()
  })

  describe('piping', function() {


    class DummyConsumer {
      constructor() {
        this._observed = []
      }

      getObserved() {
        return this._observed
      }

      write(data) {
        this._observed.push(data)
      }

      end() {
        this._endCallback()
      }

      terminate() {
        this._terminateCallback()
      }

      onRequest(callback) {
        callback(3)
      }

      onEnd(callback) {
        this._endCallback = callback
      }

      onTermination(callback) {
        this._terminateCallback = callback
      }
    }


    it('can be piped', function() {
      const buf = new BufferConduit(1)
      buf.pipe(new DummyConsumer())
    })

    it('passes data to pipee', function() {
      const buf = new BufferConduit(1)

      const expected = [
        new Uint8Array([1,2,3]),
        new Uint8Array([4,5,6]),
        new Uint8Array([7,8,9]),
      ]

      const consumer = new DummyConsumer()

      buf.pipe(consumer)

      buf.write(new Uint8Array([1,2,3]))
      buf.write(new Uint8Array([4,5,6]))
      buf.write(new Uint8Array([7,8,9]))

      expect(consumer.getObserved()).to.eql(expected)
    })

    it('end propagates to pipee', function(done) {
      this.timeout(10)
      const buf = new BufferConduit(1)
      const consumer = new DummyConsumer()
      buf.pipe(consumer)

      consumer.onEnd(() => {
        done()
      })

      buf.end()
    })

    it('terminate propagates to pipee', function(done) {
      this.timeout(10)
      const buf = new BufferConduit(1)
      const consumer = new DummyConsumer()
      buf.pipe(consumer)

      consumer.onTermination(() => {
        done()
      })

      buf.terminate()
    })

    it('pipee terminate propagates to buffer', function(done) {
      this.timeout(10)
      const buf = new BufferConduit(1)
      const consumer = new DummyConsumer()
      buf.pipe(consumer)

      buf.onTermination(() => {
        done()
      })

      consumer.terminate()
    })
  })
})
