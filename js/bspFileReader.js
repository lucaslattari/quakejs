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
    let data = this.stream.substr(this.offset, size);
    this.offset += size;

    return data;
  }

  readULong(){
    let ulong = new Uint8Array(4);
    ulong[0] = this.stream.charCodeAt(this.offset);
    ulong[1] = this.stream.charCodeAt(this.offset + 1);
    ulong[2] = this.stream.charCodeAt(this.offset + 2);
    ulong[3] = this.stream.charCodeAt(this.offset + 3);
    this.offset += 4;

    var uint32 = new Uint32Array(ulong.buffer);

    return uint32;
  }

  readLong(){
    let long = new Uint8Array(4);
    long[0] = this.stream.charCodeAt(this.offset);
    long[1] = this.stream.charCodeAt(this.offset + 1);
    long[2] = this.stream.charCodeAt(this.offset + 2);
    long[3] = this.stream.charCodeAt(this.offset + 3);
    this.offset += 4;

    var int32 = new Int32Array(long.buffer);

    return int32;
  }

  readFloat(){
    let f = new Uint8Array(4);
    f[0] = this.stream.charCodeAt(this.offset);
    f[1] = this.stream.charCodeAt(this.offset + 1);
    f[2] = this.stream.charCodeAt(this.offset + 2);
    f[3] = this.stream.charCodeAt(this.offset + 3);
    this.offset += 4;

    var f32 = new Float32Array(f.buffer);

    return f32;
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
    this.loadLumps();
  }

  loadBSPFile(filename, callback = null) {
    let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
              this.binaryData = new BinaryData(xmlHttp.response); //cria objeto com conteúdo binário
              if (callback){
                callback(xmlHttp.response);
              }
        }.bind(this);
        xmlHttp.open("GET", filename, false); // TODO: fazer funcionar assíncrono
        xmlHttp.send(null);
  }

  loadHeader(){
    this.header = {
      tag: this.binaryData.readString(4),
      version: this.binaryData.readULong(),
      lumps: []
    };

    //versão ou arquivo incompatível?
    if (this.header.tag !== "IBSP" || parseInt(this.header.version) !== 46)
      throw "Incompatible file or version.";

    for(var i = 0 ; i < 17 ; i++){
      let lump = {
        offset: this.binaryData.readULong(),
        length: this.binaryData.readULong(),
        name: this.lumpsNames[i]
      };
      this.header.lumps.push(lump);
    }

    //console.log(this.header);
  }

  loadLumps(){
    this.loadEntities();
    this.loadTextures();
    this.loadPlanes();
    this.loadNodes();
  }

  loadEntities(){
    this.binaryData.offset = this.header.lumps[0].offset;
    //console.log(this.binaryData.readString(parseInt(this.header.lumps[0].length)));
  }

  loadTextures(){
    this.binaryData.offset = this.header.lumps[1].offset;

    let sizeof_texture = 72;
    let count = this.header.lumps[1].length / sizeof_texture;

    //console.log(count_records);
    this.textures = [];
    for(let i = 0 ; i < count ; i++){
      let texture = {
        name: this.binaryData.readString(64),
        surface_flags: this.binaryData.readLong(),
        contents_flags: this.binaryData.readLong(),
      }

      //console.log(texture.name);
      this.textures.push(texture);
    }
  }

  loadPlanes(){
    this.binaryData.offset = this.header.lumps[2].offset;

    let sizeof_plane = 16;
    let count = this.header.lumps[2].length / sizeof_plane;

    //console.log(count);
    this.planes = [];
    for(let i = 0 ; i < count ; i++){
      let plane = {
        normal: [ this.binaryData.readFloat(),
                  this.binaryData.readFloat(),
                  this.binaryData.readFloat()
                ],
        distance_from_origin_to_plane: this.binaryData.readFloat(),
      }

      //console.log(plane);
      this.planes.push(plane);
    }
  }

  loadNodes(){
    this.binaryData.offset = this.header.lumps[3].offset;

    let sizeof_nodes = 36;
    let count = this.header.lumps[3].length / sizeof_nodes;

    //console.log(count);
    this.nodes = [];
    for(let i = 0 ; i < count ; i++){
      let node = {
        plane_index: this.binaryData.readLong(),
        children_indices:
                [ this.binaryData.readLong(),
                  this.binaryData.readLong()
                ],
        bbox_min_coord:
                [ this.binaryData.readLong(),
                  this.binaryData.readLong(),
                  this.binaryData.readLong()
                ],
        bbox_max_coord:
                [ this.binaryData.readLong(),
                  this.binaryData.readLong(),
                  this.binaryData.readLong()
                ],
      }

      console.log(node);
      this.nodes.push(node);
    }
  }
}
