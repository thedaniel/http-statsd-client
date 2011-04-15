// This is a simple client for the http fork of statsd found at
// https://github.com/thedaniel/statsd . It sends XHR PUTs in the form that
// statsd expects, and optionally bundles metrics to reduce the number of
// requests made. Its public interface is based on the python client example in
// statsd.
//
// It is initialized with a params object that controls how the stats are
// batched to be sent to statsd, and where the stats are sent. If you have your
// own ajax manager, you can optionally pass it in, otherwise jQuery's is
// used. jQuery is otherwise not required.

var StatsdClient = function(params){
  this.host = params.host || 'http://127.0.0.1:8126';
  this.bundleSize = params.bundleSize || 1;
  this.ajax = params.ajax || $.ajax;
  this._stats = [];
};

//# Public Interface

// All of these methods take stats as the first positional variable. It can be
// a string representing the stat name or an array of stats to update all at
// once.

// Log timing information

StatsdClient.prototype.timing = function(stats, time, sampleRate) {
  sampleRate = sampleRate || 1;
  this.update_stats(stats, time, sampleRate);
}

// Increment a counter

StatsdClient.prototype.increment = function(stats, sampleRate) {
  sampleRate = sampleRate || 1;
  this.update_stats(stats, 1, sampleRate);
}

// decrement a counter

StatsdClient.prototype.decrement = function(stats, sampleRate) {
  sampleRate = sampleRate || 1;
  this.update_stats(stats, -1, sampleRate);
}

// The update_stats method adds the stat to the list at this.stats and checks to see if
// there are enough stats to flush, based on the bundleSize parameter that
// StatsdClient was initialized with

StatsdClient.prototype.update_stats = function(stat) {
  if(!(stat instanceof Array)) {
    stat = [stat];
  }
  for (var i=0; i<stat.length; i++){
    this._stats.push(stat[i]);
  }

  if (this._stats.length >= this.bundleSize){
    this._flush();
  }


//# Private Interface

//### _flush

// This simply takes the stats available and sends them to statsd in the
// correct format

StatsdClient.prototype._flush = function() {
  if (!this._stats.length) {
    console.log('attempted to flush empty stats');
  } else {
    var putData = this._stats.join(';');
    this.ajax(
      this.host,
      {
        method: 'PUT',
        data: {m: putData}
    )
  }
}

//# Notes

//* This was originally written for an environment that ignored cross-domain problems
//* This should probably be a commonJS module