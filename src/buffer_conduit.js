class BufferConduit {
  constructor(bufferSize) {
    this._ended = false
    this._terminated = false
    this._downstreamDemand = 0
    this._buffered = []
    this._bufferSize = bufferSize

    this._requestCallback = () => {}
    this._dataCallback = () => {}
    this._endCallback = () => {}
    this._terminationCallback = () => {}
  }

  _flush() {
    while (this._downstreamDemand > 0 && this._buffered.length > 0) {
      this._dataCallback(this._buffered.shift())
      this._downstreamDemand--
      this._requestCallback(1)
    }
    
    if (this._ended && this._buffered.length === 0) {
      if (this._pipee) {
        this._pipee.end()
      }
      this._endCallback()
    }
  }

  terminate() {
    if (!this._terminated) {

      this._terminated = true

      if (this._pipee) {
        this._pipee.terminate()
      }
      this._terminationCallback()
    }
  }

  onTermination(callback) {
    this._terminationCallback = callback
  }

  // Consumer
  write(data) {
    if (this._buffered.length < this._bufferSize) {
      this._buffered.push(data)
    }
    else {
      throw new Error("BufferConduit: Attempt to write more than requested")
    }

    this._flush()
  }

  end() {
    this._ended = true

    this._flush()
  }

  onRequest(callback) {
    this._requestCallback = callback
    callback(this._bufferSize - this._buffered.length)
  }


  // Producer
  request(numItems) {
    this._downstreamDemand += numItems
    this._flush()
  }

  pipe(consumer) {

    this._pipee = consumer

    this.onData((data) => {
      consumer.write(data)
    })

    consumer.onRequest((numItems) => {
      this.request(numItems)
    })

    consumer.onTermination(() => {
      this.terminate()
    })
  }

  onData(callback) {
    this._dataCallback = callback
  }

  onEnd(callback) {
    this._endCallback = callback
  }
}

module.exports = {
  BufferConduit,
}
