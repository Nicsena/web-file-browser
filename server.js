// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const fs = require("fs-extra");
const got = require("got");
const defaultpath = "" + "/"
const default_path = defaultpath
const dotfiles = process.env.SHOW_DOT_FILES
const DEBUG = process.env.DEBUG
const PROJECTNAME = process.env.PROJECT_NAME

//app.use(express.static("public"));
app.set('view engine', 'ejs');

app.set('views', __dirname + '/htdocs/')

const blacklisteddot = require("./blacklisted_dot.json")
const blacklisted = require("./blacklisted_files.json")



function getFile(text, file) {

  const fileslist = []
  
  try {
    
      if(fs.lstatSync(`${text}`).isFile() ) { 
    
        

          if(text.includes(".bash_history") || (text.includes(".config") || (text.includes(".data") || (text.includes(".env") || (text.includes(".git") || (text.includes(".glitch-assets") || (text.includes(".node-gyp")))))))) {
            
            fileslist.push(`404 - Directory or File not found!`)
            
          return `${fileslist}`
        } else {
        
          if(text.includes(".config") || (text.includes(".data") || (text.includes(".git") || (text.includes(".node-gyp"))))) {
           

              
              fileslist.push(`403 - Access Denied - You are not allowed to see this file or folder, and its contents inside.`)
              
          return `${fileslist}`
        
        }}
  

    
        
  const data = fs.readFileSync(`${text}`, 'utf8')
  //console.log(data)
      
  
  
  
   if(!data.toString('utf8').length || (!data.toString('utf8')) || (data.toString('utf8').length === "0")) {
     return " "
   }
        
  const content = data.toString('utf8')
  
  return `${content}`

}
            

    
} catch(e) {

    console.error(e)
  return "An error has occurred reading this file. The error has been logged to the console."
  
}
  
}




function getList(path) {
  
const fileslist = []
global.filelist = []
const fileslistnodot = []
global.filelistnodot = []
   const filesnodot = [] 
     const filesdatelist = new Array();

  



try {
  
fs.readdirSync(path).forEach(file => {
  
  if(fs.lstatSync(`${path}/${file}`).isDirectory() ) { // Check if the file is a directory or a folder or not.
    
      if(dotfiles === "FALSE") {
        
      if(file.startsWith(".")) {
      filesnodot.push(file)
      return ""
      } else {
       if(file.startsWith("blacklisted_")) {
      filesnodot.push(file)
       return "" 
      } else {
      
        
      //fileslistnodot.push(`${file}/`) 
       //console.log(global.fileslistnodot)
      
      }}}
    
    if(DEBUG === "true") console.log(`Folder: ${file}`)
    
    
    fileslist.push(`${file}/`) // If it is a folder, add / to it to show that it is a directory or a folder
    
  } else {
    
    if(dotfiles === "FALSE") {
     
      if(file.startsWith(".")) {
        filesnodot.push(file)
        return ""
      } else {
            if(file.startsWith("blacklisted_")) {
    return "" 
    }
      //fileslist.push(file)
      }
    }
  
    if(file.startsWith("blacklisted_")) {
    return "" 
    }

  if(DEBUG === "true") console.log(`File: ${file}`)
    
  fileslist.push(file) // If it is a file

    
  }
    
});

  
    if(dotfiles === "FALSE") {
      //fileslistnodot.forEach(myFunction);
    }
  
    if(DEBUG === "true") console.log(`Now getting dates of files`)
  
  fileslist.forEach(getDateofFile);
  
 function getDateofFile(item, index) {
   
// fetch file details
try {
    const stats = fs.statSync(`${defaultpath}/${path}/${item}`);
  
    const modifiedtime = stats.mtime

    // print file last modified date
    //console.log(`File Data Last Modified: ${stats.mtime}`);
    
     if(DEBUG === "true") console.log(`${defaultpath}/${path}/${item} - M: ${modifiedtime}`)
    
    filesdatelist.push(`"${item.replace("/", "")}": { "date": "${modifiedtime}" }`)
  
    //console.log(`File Status Last Modified: ${stats.ctime}`);
} catch (error) {
  
  global.errorcode = error.code
  global.errordesc = error
  
    console.log(error);
}
   
        global.filedatelist = filesdatelist
   
   
 } 


  
  
const itemwithdate = `{ ${global.filedatelist} }` 

if(DEBUG === "true") console.log(`Writing JSON File.`);

fs.writeFileSync('/tmp/fileandfolderdates.json', itemwithdate);

if(DEBUG === "true") console.log(`Wrote JSON File.`);
  
//console.log(itemwithdate)

  
try {
  
  if(DEBUG === "true") console.log(`Reading JSON File`);
  
  const data = fs.readFileSync('/tmp/fileandfolderdates.json', 'utf8')
  global.itemwithdate = data
  
  if(DEBUG === "true") { console.log(`Read JSON File. Now showing Result.`); console.log(`Result: ${data}`); }
  
} catch (err) {
  
  global.errorcode = err.code
  global.errordesc = err
  
  console.error(err)
}
  
  
  fileslist.forEach(myFunction);
  
function myFunction(item, index) {
  
  if(DEBUG === "true") console.log("Reading JSON File - MyFunction")
  
  const data = fs.readFileSync('/tmp/fileandfolderdates.json', 'utf8')
  
  if(DEBUG === "true") console.log(`Read JSON File - MyFunction`)
  
  const files = JSON.parse(data)
  
  if(DEBUG === "true") console.log(`MyFunction - Files Result: ${files}`)

  
  const dates = files[item.replace('/', '')]["date"].replace('GMT-0700 (Pacific Daylight Time)', '')

  //global.filelist += `${item} &nbsp; &nbsp; | &nbsp; M: ${dates} <br>`
  //global.filelist += `${item} <br>`
  global.filelist += `<a href="${item}">${item}<br>`

  return global.filelist
  
  
}
  
  
  if(DEBUG === "true") console.log(`File List (fileslist) Result: ${fileslist}`)
  if(DEBUG === "true") console.log(`Global File List (global.filelist) Result: ${global.filelist}`)
  
  if(DEBUG === "true") console.log(`dot File List (fileslistnodot) Result: ${fileslistnodot}`)
  if(DEBUG === "true") console.log(`Global File No dot List (global.filelistnodot) Result: ${global.filelistnodot}`)
  
  if(DEBUG === "true") console.log(`dot files (filesnodot) Result: ${filesnodot}`)
  
  if(DEBUG === "true") console.log(`Files with Date (filesdatelist) Result: ${filesdatelist}`)
  
  
  
  return global.filelist
  
} catch(e) {

  if(e.code === "ENOENT") {
    
  fileslist.push(`404 - Directory or File not found!<br>`)
    return fileslist  
    
  } else {
    
    if(e.code === "EACCES") {
      
        fileslist.push(`403 - Forbidden - Access Denied`)
    return fileslist  
      
      
    } else {
      
      
      if(e.code === "ENOTDIR") {
        
        global.errorcode = e.code
        global.errordesc = "<code>" +e + "</code>"
        
       const fileslist = [] 
       
        
       //fileslist.push(`${getFile(path)}`);
       return getFile(path)

      }
        
  global.errorcode = e.code
  global.errordesc = e
  
      
  fileslist.push(`An error has occurred. The error has been logged to the console.`)
  console.log(`ERROR:\n\n${e.code}\n\n${e}`)
  return fileslist
    
    }
  
    
}
}}



app.get('/', (req, res) => {

const names = `https://${PROJECTNAME}.glitch.me/listfiles?path=${default_path}`


got(`${names}`).then(r => {
let content = r.body

  res.render('index', {path: default_path} );

}).catch(error => {

  console.log(`ERROR - ${error}`)
  
  return res.render('index', {path: ``});
  
});
  
}); 


app.get('/old', (req, res) => {
  
 const names = `https://${PROJECTNAME}.glitch.me/listfiles?path=${default_path}`


got(`${names}`).then(r => {
let content = r.body

  res.render('index-old', {files: content, path: default_path });

}).catch(error => {

  console.error(`ERROR - ${error}`)
  return res.render('index-old', {files: ` `, path: `` });
  
});
  
  
  
})


app.get('/new/client.js', (req, res) => {

res.send(__dirname + "/views/client.js")

});




app.get('/listfiles', (req, res) => {
  
  const path = req.query.path

  
  const files_list = getList(path);
  
  //console.log(`/listfiles endpoint - ${files_list}`)
  
  return res.render('filelist', {files: files_list} );
  
  
  
});


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  //console.log("Your app is listening at " +listener.address().address +":" + listener.address().port);
});
