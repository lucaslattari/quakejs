const express = require('express')
const app = express()
const path = require('path')

//Points to our public web server folder, which we haven’t created yet, but we’ll create in the next step.
app.use(express.static(__dirname + '/public'))
//Points to the Three.js /build/ folder containing the mainthree.module.js file that our html client will load.
app.use('/build/', express.static(path.join(__dirname, 'three.js/build')));
//Points to the /jsm/ folder which contains many extra useful Three.js modules, which are commonly used within the official Three.js examples. Some of the examples are the OrbitControls, Stats.js, Dat.GUI, Loaders, and hundreds of other very more useful modules.
app.use('/jsm/', express.static(path.join(__dirname, 'three.js/examples/jsm')));
app.use('/js/', express.static(path.join(__dirname, 'js/')));

app.listen(3000, () =>
  console.log('Visit http://127.0.0.1:3000')
);
