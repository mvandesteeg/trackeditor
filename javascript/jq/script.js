"use strict";

var currentPosition = 0;
var scheduleID = undefined;
var context = undefined;

var MAX = 48;
var MAX_TRACKS = 6;

var activeVoices = [];

var currentOctave = 4;

var scale = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ];

var loopPlay = false;

// Takes string of Note + Octave
// Example:
// var frequency = getFrequency('C3');
var getFrequency = function (note) {
    var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
        octave,
        keyNumber;

    if (note.length === 3) {
        octave = note.charAt(2);
    } else {
        octave = note.charAt(1);
    }

    keyNumber = notes.indexOf(note.slice(0, -1));

    if (keyNumber < 3) {
        keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1;
    } else {
        keyNumber = keyNumber + ((octave - 1) * 12) + 1;
    }

    // Return frequency of note
    return 440 * Math.pow(2, (keyNumber- 49) / 12);
}

var trackplayer = new TrackPlayer();

var resetAllTracks = function() {
    resetPlayer( false );
    $("li", ".notes").each( function() {
        $(this).removeClass();
        $(this).html("");
        $(this).addClass("note");
        $(this).addClass("none");
    } );
}

var addNote = function(posElement, note, octave) {
    $(posElement).html("");
    $(posElement).append("<div class='circle note_" + note + " octave" + octave + "'>" + note + "</div>");

    $(".circle", posElement).on("click", function(e){
        e.stopPropagation();
        // same octave, so remove it
        if( $(this).hasClass("octave" + currentOctave ) ) {
            var parent = $(this).parent().get(0);
            $(parent).html("");
        }
        else
        {
            // different octave, so replace it
            for(var o = 3; o < 7; o++ ) {
                $(this).removeClass("octave" + o );
            }
            $(this).addClass("octave" + currentOctave );
        }
    });
}

var updatePosition = function() {
    $("#currentPos").html( (currentPosition + 1) + "/" + MAX );
}

var showPlayerDiv = function() {
    setPlayerDivLocation( currentPosition, "rgb(50,0,255)" );
}

var hidePlayerDiv = function() {
    setPlayerDivLocation( currentPosition, "black" );
}

var setPlayerDivLocation = function(pos, colour) {
    if( pos - 1 < 0 ) {
        return;
    }
    $(".notes").each( function() {
            var children = $(this).children();
            var target = children.get(pos - 1);
            $(target).css("background", colour);
        });
}

var resetPlayer = function( showMarker ) {
    hidePlayerDiv();
    currentPosition = 0;
    updatePosition();
    if( showMarker ) {
        showPlayerDiv();
    }
}

var stopNotes = function() {
    for( var v = 0; v < activeVoices.length; v++ ) {
        activeVoices[v].stop();
    }
    activeVoices.length = 0;
}

var playNote = function(pos) {

    stopNotes();

    var index = 0;

    $(".notes").each( function() {
            var children = $(this).children();
            var target = children.get(pos);

            var notechildren = $(target).children();
            if( notechildren.length > 0 ) {
                var note = notechildren.get(0);

                var theNote = "";

                for(var s = 0; s < scale.length; s++ ) {
                    if( $(note).hasClass("note_" + scale[s]) ) {
                        theNote += scale[s].toUpperCase();
                    }
                }

                for(var o = 3; o < 7; o++ ) {
                    if( $(note).hasClass("octave" + o) ) {
                        theNote += o;
                    }
                }

                if( theNote != "" ) {
                    activeVoices[index] = new Voice( getFrequency(theNote), context);
                    index++;
                }
            }
    });

    // play all the notes
    for(var v = 0; v < activeVoices.length; v++ ) {
        activeVoices[v].start();
    }
}

var canPlayThisNote = function( pos ) {
    var markers = $(".playmarkers").children();
    var marker = markers.get(pos);

    if( $(marker).hasClass("inBetween") ||
        $(marker).hasClass("startMarker") ||
        $(marker).hasClass("endMarker")
        )
    {
        return true;
    }
    return false;
}

var advanceNote = function() {

    var continuePlaying = true;

    hidePlayerDiv();

    do {
        currentPosition++;
        if( currentPosition > MAX ) {
            currentPosition = 0;
            if( !loopPlay ) {
                continuePlaying = false;
                break;
            }
        }
    }
    while( !canPlayThisNote(currentPosition - 1) );

    updatePosition();
    showPlayerDiv();

    return continuePlaying;
}

var schedule = function() {
    playNote(currentPosition);
    if( advanceNote() ) {
        scheduleID = setTimeout(schedule, 400);
    }
    else
    {
        $( "#stop" ).trigger( "click" );
    }
}

var processAllMarkers = function() {
    var children = $(".playmarkers").children();

    var afterStart = false;
    for(var i = 0; i < children.length; i++ ) {
        var m = children.get(i);

        $(m).removeClass("inBetween");

        if( $(m).hasClass("startMarker") ) {
            afterStart = true;
            continue;
        }
        if( $(m).hasClass("endMarker") ) {
            afterStart = false;
            continue;
        }

        if( afterStart ) {
            $(m).addClass("inBetween");
        }
    }
}

// for debugging - dump the track data to the console, can then paste it straight into songs.js
var dumpTrackData = function() {

    var data = {};

    data.name = $("#trackname").val();
    data.tracks = [];

    var tracks = $(".tracklisting").children();

    for( var i = 0; i < tracks.length; i++ ) {
            var track = $("#track" + i, tracks);
            var target = $(".notes", track);
            var targetnotes = $(target).children();

            var storeTrack = "";

            for(var x = 0; x < targetnotes.length; x++) {
                var note = "";
                var theNote = $(".circle", targetnotes.get(x));

                for( var s = 0; s < scale.length; s++ ) {
                    if( $(theNote).hasClass("note_" + scale[s]) ) {
                        note += scale[s].toUpperCase();
                    }
                }
                for( var o = 3; o < 7; o++ ) {
                    if( $(theNote).hasClass("octave" + o) ) {
                        note += o;
                    }
                }

                if( note === '' ) {
                    note = "..";
                }
                storeTrack += note;
            }
            data.tracks[i] = storeTrack;
        }
    console.log( JSON.stringify(data) );
}

$( document ).ready(function() {

    // TODO - replace this with responsive stylesheets
    // Bad bad bad hack
    if( $(window).height() < 900 ) {
        MAX_TRACKS = 5;
    }
    if( $(window).height() < 800 ) {
        MAX_TRACKS = 4;
    }
    if( $(window).height() < 750 ) {
        MAX_TRACKS = 3;
    }
    if( $(window).height() < 650 ) {
        MAX_TRACKS = 2;
    }

    // calc how many notes we can fit on the screen
    MAX = Math.floor(($(window).width() - 80) / 20);

    // create the webaudio context
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
	context = new AudioContext();
	} catch (error) {
            // TODO
    }

    trackplayer.init(MAX_TRACKS);

    trackplayer.renderTracks( $(".tracklisting") );

    // append the blank note blocks to each track
    $(".notes").each( function() {
            for(var i = 0; i < MAX; i++ ) {
                $(this).append("<li class='note none'></li>");
            }
        });

    // generate the playmarkers
    for(var i = 0; i < MAX; i++ ) {
        var cl = "";
        if( i == 0 ) {
            cl = " class='startMarker'";
        }
        if( i == MAX - 1 ) {
            cl = " class='endMarker'";
        }
        $(".playmarkers").append("<li" + cl + "></li>");
    }

    $("#recycle").click( function(e) {
            clearTimeout(scheduleID);
            stopNotes();
            resetAllTracks();
        });

    $("#play").click( function(e) {
            showPlayerDiv();
            schedule();
            $("#pause").show();
            $("#play").hide();
        });

    $("#stop").click( function(e) {
            clearTimeout(scheduleID);
            resetPlayer( false );
            stopNotes();
            $("#pause").hide();
            $("#play").show();
        });

    $("#pause").click( function(e) {
            clearTimeout(scheduleID);
            stopNotes();
            $("#pause").hide();
            $("#play").show();
        });

    $("#rewind").click( function(e) {
            resetPlayer( true );
        });

    $("#repeat").click( function(e) {
            loopPlay = !loopPlay;

            if( loopPlay ) {
                $(this).addClass("buttonselected");
            }
            else
            {
                $(this).removeClass("buttonselected");
            }

            // for debugging
            dumpTrackData();
        });

    // add a new note at selected location
    $(".note").click( function(e) {
        e.preventDefault();

        // hack for non-chrome browsers
        var offX = (e.offsetX || e.clientX - $(e.target).offset().left);
        var offY = (e.offsetY || e.clientY - $(e.target).offset().top + window.pageYOffset );

        // place note depending on where user clicked on the div
        if( offY < 10 ) {
            addNote( $(this), "b", currentOctave );
        }
        if( offY >= 10 && offY < 20 ) {
            addNote( $(this), "a", currentOctave );
        }
        if( offY >= 20 && offY < 30 ) {
            addNote( $(this), "g", currentOctave );
        }
        if( offY >= 30 && offY < 40 ) {
            addNote( $(this), "f", currentOctave );
        }
        if( offY >= 40 && offY < 50 ) {
            addNote( $(this), "e", currentOctave );
        }
        if( offY >= 50 && offY < 60 ) {
            addNote( $(this), "d", currentOctave );
        }
        if( offY >= 60 ) {
            addNote( $(this), "c", currentOctave );
        }
    });

    // attach a handler to the coloured octave buttons
    $(".octave").click( function(e){
        var o = parseInt($(this).data("octave"), 10);
        currentOctave = o;
        $(".octave").each( function() {
                $(this).removeClass("selectedOctaveButton");
            });
        $(this).addClass("selectedOctaveButton");
    });

    // hide the pause button
    $("#pause").hide();

    // setup the song selection drop down
    var selector = $("#exampleSongs");
    $(selector).append("<option value=''>---</option>");
    for(var i =0; i < songs.length; i++ ) {
        $(selector).append("<option value='" + i + "'>" + songs[i].name + "</option>");
    }

    // load an example song when the user selects an item from the drop down list
    $("#exampleSongs").change( function() {
        resetAllTracks();

        var index = $(this).val();

        if( index === '' ) {
            $("#trackname").val("New track");
            return;
        }

        var song = songs[ parseInt(index, 10) ];
        $("#trackname").val(song.name);

        for( var i = 0; i < song.tracks.length; i++ ) {
            var track = song.tracks[i];
            var target = $(".notes", "#track" + i);
            var targetnotes = $(target).children();
            for(var x = 0; x < track.length; x += 2) {
                var note = track.substring(x, x + 2);
                if( note !== ".." ) {
                   var n = note.substring(0,1).toLowerCase();
                   var o = parseInt(note.substring(1,2), 10);

                   var dest = targetnotes.get(x / 2);
                   addNote(dest, n, o);
                }
            }
        }
    });

    // attach a handler for the play markers
    $("li", ".playmarkers").click( function() {
        $(this).removeClass("inBetween");
        if( $(this).hasClass("endMarker") ) {
            $(this).removeClass("endMarker");
        }
        else if( $(this).hasClass("startMarker") ) {
            $(this).removeClass("startMarker");
            $(this).addClass("endMarker");
        }
        else
        {
            $(this).addClass("startMarker");
        }

        // reset all the markers
        processAllMarkers();
    });

    processAllMarkers();
    updatePosition();
});
