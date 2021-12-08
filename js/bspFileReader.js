//https://www.w3schools.com/xml/xml_http.asp
//https://stackoverflow.com/questions/38915527/javascript-readasarraybuffer-from-url
/*export function loadBSPFile(filename, callback) {
  var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
              callback(xmlHttp.response);
      }
      xmlHttp.open("GET", filename, true); // true for asynchronous
      xmlHttp.send(null);

      return xmlHttp.responseText;
}*/

class BinaryData{
  constructor(stream){
    this.stream = stream;
    this.offset = 0;
  }

  readString(size){
    var data = this.stream.substr(this.offset, size);
    this.offset += size;

    return data;
  }

  readULong(){
    var ulong = new Uint8Array(4);
    ulong[0] = this.stream.charCodeAt(this.offset);
    ulong[1] = this.stream.charCodeAt(this.offset + 1);
    ulong[2] = this.stream.charCodeAt(this.offset + 2);
    ulong[3] = this.stream.charCodeAt(this.offset + 3);
    this.offset += 4;

    var uint32 = new Uint32Array(ulong.buffer);

    return uint32;
  }
}

export class BSPFileReader{
  constructor(filename){
    this.filename = filename;
    this.lumpsNames = [
      'entities', 'textures', 'planes', 'nodes', 'leafs', 'leaffaces',
      'leafbrushes', 'models', 'brushes', 'brushsides', 'vertexes',
      'meshverts', 'effects', 'faces', 'lightmaps', 'lightvols', 'visdata'
    ];
  }

  load(){
    this.loadBSPFile(this.filename);
    this.loadHeader();
  }

  loadBSPFile(filename, callback) {
    var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
              this.binaryData = new BinaryData(xmlHttp.response); //cria objeto com conteúdo binário
              if (callback){
                callback(xmlHttp.response);
              }
        }.bind(this);
        xmlHttp.open("GET", filename, false); // true for asynchronous
        xmlHttp.send(null);
  }

  loadHeader(){
    this.header = {
      tag: this.binaryData.readString(4),
      version: this.binaryData.readULong(),
      lumps: []
    };

    for(var i = 0 ; i < 17 ; i++){
      var lump = {
        offset: this.binaryData.readULong(),
        length: this.binaryData.readULong(),
        name: this.lumpsNames[i]
      };
      this.header.lumps.push(lump);
    }

    console.log(this.header);
  }
}
