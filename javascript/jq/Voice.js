var Voice = function(frequency, context){
      this.context = context;
      this.frequency = frequency;
      this.oscillators = [];
      
      this.attack = 10;
      this.decay = 250;
}

Voice.prototype.start = function() {
  /* VCO */
  var vco = this.context.createOscillator();
  vco.type = vco.SINE;
  vco.frequency.value = this.frequency;

  /* VCA */
  var vca = this.context.createGain();
  vca.gain.value = 0.0;
  vca.gain.setValueAtTime(0, this.context.currentTime);
  vca.gain.linearRampToValueAtTime(1, this.context.currentTime + this.attack / 1000);
  vca.gain.linearRampToValueAtTime(0, this.context.currentTime + this.decay / 1000);
    
  /* connections */
  vco.connect(vca);
  vca.connect(this.context.destination);

  vco.start(0);

  /* Keep track of the oscillators used */
  this.oscillators.push(vco);
}

Voice.prototype.stop = function() {
  this.oscillators.forEach(function(oscillator) {    
    oscillator.disconnect();
  });
}
    
