var TrackPlayer = function() {    
    this.tracks = new Array();        
}

TrackPlayer.prototype.init = function( howMany ) {    
    // create a bunch of empty tracks
    for(var i = 0; i < howMany; i++ ) {
        this.tracks[i] = new Track(i, "Track " + (i + 1) );
    }
}

TrackPlayer.prototype.renderTracks = function( root ) {
    for(var i = 0; i < this.tracks.length; i++ ) {
        $(root).append( this.tracks[i].render() );
    }
}
