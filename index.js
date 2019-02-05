class MapConduit {
  constructor(mapFunc) {
    //this._mapFunc = (data) => {
    //  return this._encode(mapFunc(this._decode(data)))
    //}
    this._mapFunc = mapFunc
    this._demand = 0
  }

  // Consumer
  write(data) {
    if (this._demand > 0) {
      this._demand--
      this._dataCallback(this._mapFunc(data))
    }
    else {
      throw "Demand is 0 and we have no buffer"
    }
  }

  end() {
    this._endCallback()
  }

  request(numElements) {
    this._demand += numElements
    this._requestCallback(numElements)
  }

  // Producer
  onData(callback) {
    this._dataCallback = callback
  }

  onEnd(callback) {
    this._endCallback = callback
  }

  onRequest(callback) {
    this._requestCallback = callback
  }

  onTermination(callback) {
    this._terminationCallback = callback
  }

  setEncodeFunc(func) {
    this._encode = func
  }

  setDecodeFunc(func) {
    this._decode = func
  }
}

class Splitter {
  constructor({ producer, consumer1, consumer2 }) {
    this._producer = producer
    this._consumer1 = consumer1
    this._consumer2 = consumer2

    const p = producer
    const c1 = consumer1
    const c2 = consumer2
    let totalRequested = 0
    let c1TotalRequested = 0
    let c2TotalRequested = 0

    let totalDelivered = 0

    let c1Demand = 0
    let c2Demand = 0
    let outstanding = 0

    p.onData((data) => {
      console.log("got data")
      //c1Demand -= data.length
      //c2Demand -= data.length
    })

    c1.onRequest((numElements) => {
      console.log("get some 1: " + numElements)
      c1Demand += numElements
      c1TotalRequested += numElements

      const diff = c1TotalRequested - totalRequested
      if (diff > 0) {
        totalRequested += numElements
      }
    })

    c2.onRequest((numElements) => {
      console.log("get some 2: " + numElements)
      c2Demand += numElements

      const diff = c2TotalRequested - totalRequested
      if (diff > 0) {
        totalRequested += numElements
      }
    })

    function request() {
      if (c1Demand < c2Demand) {
      }
      else {
      }
    }

    function flush() {
    }
  }

  onRequest(callback) {
    this._requestCallback = callback
  }

  onTermination(callback) {
    this._terminationCallback = callback
  }
}

module.exports = {
  MapConduit,
  Splitter,
}
