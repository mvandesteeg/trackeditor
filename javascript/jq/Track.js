var Track = function(id, name) {
    this.id = id;
    this.name = name;    
}

Track.prototype.render = function() {
    var html = "<li><div class='track' id='track" + this.id + "'><h4>" + this.name + "</h4><ul class='notes'></ul></div></li>";
    return html;
}
