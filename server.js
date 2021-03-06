// --------------------------------------------
// variables and constants
// --------------------------------------------

const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const formidable = require('formidable');
const hbs = require("express-handlebars");
var filetable = [];
var idcounter = 1;

const PORT = process.env.PORT || 3000;

// --------------------------------------------
// server settings
// --------------------------------------------

app.use(express.static("static"))
app.use(bodyParser.urlencoded({ extended: true }));

// hbs
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
   defaultLayout: 'main.hbs',
   extname: '.hbs',
   partialsDir: "views/partials",
   helpers: {
      imageselect: (type) => {
         if (type == "image/png") return "png.png"
         else if (type == "image/jpeg") return "jpg.png"
         else if (type == "application/pdf") return "pdf.png"
         else if (type == "text/plain") return "txt.png"
         else return "another.png";
      }
   }
}));
app.set('view engine', 'hbs');

// --------------------------------------------
// sending/receive informations on site
// --------------------------------------------

app.get("/", (req, res) => {
   res.redirect('/upload')
})

//#region upload
app.get("/upload", (req, res) => {
   res.render('upload.hbs');
})

app.post('/upload', (req, res) => {
   var form = new formidable.IncomingForm();
   form.uploadDir = __dirname + '/static/upload/'       // folder do zapisu zdjęcia
   form.keepExtensions = true                           // zapis z rozszerzeniem pliku
   form.multiples = true                                // zapis wielu plików                          

   form.parse(req, (err, fields, files) => {
      // console.log(files);
      if (!Array.isArray(files.imagetoupload)) PushToTable(files.imagetoupload);

      else files.imagetoupload.forEach(el => PushToTable(el));

      res.redirect('/filemanager')
   });
});

function PushToTable(file) {
   filetable.push({
      id: idcounter,
      uploadName: file.path.replace(/\\/g, "/").split("/").pop(),
      name: file.name,
      path: file.path,
      size: file.size,
      type: file.type,
      savedate: Date.now()
   });
   idcounter++;
}
//#endregion

//#region filemanager
app.get("/filemanager", (req, res) => {
   if (req.query.action == 'delete') {
      filetable = filetable.filter(el => (req.query.id != el.id))

      res.redirect('/filemanager')
   }
   else if (req.query.action == 'deleteAll') {
      idcounter = 1;
      filetable = [];
      res.redirect('/filemanager')
   }
   else res.render('filemanager.hbs', { filetable: filetable });
})
//#endregion

//#region info
app.get("/info", (req, res) => {
   if (req.query.id == undefined) {
      res.render('info.hbs');
   }
   else {
      res.render('info.hbs',
         filetable.find(el => (el.id == req.query.id))
      );
   }
})
//#endregion

// --------------------------------------------
// port listening
// --------------------------------------------

app.listen(PORT, () => console.info(`start serwera na porcie ${PORT}`))