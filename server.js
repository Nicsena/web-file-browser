// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const fs = require("fs-extra");
const got = require("got");
const defaultpath = `${__dirname}/`
const default_path = defaultpath
const dotfiles = process.env.SHOW_DOT_FILES

const os = require("os");

//app.use(express.static("public"));
app.set('view engine', 'ejs');

app.set('views', __dirname + '/htdocs/')

const blacklisteddot = require("./blacklisted_dot.json")
const blacklisted = require("./blacklisted_files.json")

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getFile(text, file) {

  const fileslist = []
  
  try {
    
      if(fs.lstatSync(`/${defaultpath}/${text}`).isFile() ) { 
    
  
global.path = `Content of ${text}`
global.upone = `<a class="bold" href="./">&#8592; Exit File</a> </h4> <br><br>`
    
        
  const data = fs.readFileSync(`${defaultpath}/${text}`, 'utf8')
  //console.log(data)
      
  
  
  
   if(!data.toString('utf8').length || (!data.toString('utf8')) || (data.toString('utf8').length === "0")) {
     return " "
   }
        
        
  const content = data.toString('utf8')
          //const content = data

 // return `<a style=""> <code> ${content} </code> </a>`

  return `${content}`
  
}
            

    
} catch(e) {

  global.upone = `<a class="bold" href="./../">&#8592; Exit File</a> </h4> <br><br>`
  
    console.error(e)
  return "An error has occurred reading this file. The error has been logged to the console.<br>"
  
}
  
}


function getList(path) {
  
const fileslist = new Array();
global.filelist = new Array();
const fileslistnodot = new Array();
global.filelistnodot = new Array();
   const filesnodot = new Array();
   const filesdatelist = new Array();
   global.fileslistnone = new Array();
   
           
  global.errorcode = ``
  global.errordesc = ``
  




try {
  
fs.readdirSync(defaultpath + "" +path).forEach(file => {
  
  console.log(file)
  
  if(fs.lstatSync(`${defaultpath}/${path}/${file}`).isDirectory() ) { // Check if the file is a directory or a folder or not.
    
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
    
  fileslist.push(file)
    
    
  //console.log(fileslist)
    
  }
    
});

  
    if(dotfiles === "FALSE") {
      //fileslistnodot.forEach(myFunction);
    }
  
  global.fileslistnone = []
  
      global.fileslistnone.push(fileslist)

  fileslist.forEach(getDateofFile);
  
 function getDateofFile(item, index) {
   
// fetch file details
try {
    const stats = fs.statSync(`${defaultpath}/${path}/${item}`);
  
    const modifiedtime = stats.mtime
    const createdtime = stats.birthtime
    const accesstime = stats.atime
    const filesize = formatBytes(stats.size)
    const filesizeunformat = stats.size
    const filepermissions = '0' + (stats.mode & parseInt('777', 8)).toString(8);
    
// -> 2018-12-28T10:29:43.879Z

    // print file last modified date
    //console.log(`File Data Last Modified: ${stats.mtime}`);
    filesdatelist.push(`"${item.replace("/", "")}": {"size":"${filesize} (${filesizeunformat})", "permissions":"${filepermissions}", "accesstime": "${accesstime}", "createddate": "${createdtime}", "modifieddate": "${modifiedtime}" }`)
  
    //console.log(`File Status Last Modified: ${stats.ctime}`);
} catch (error) {
  
  global.errorcode = error.code
  global.errordesc = error
  
    console.log(error);
}
   
        global.filedatelist = filesdatelist
 
   
 } 


  
  
const itemwithdate = `{ ${global.filedatelist} }` 
    
fs.writeFileSync('/tmp/fileandfolderdates.json', itemwithdate);

  
try {
  const data = fs.readFileSync('/tmp/fileandfolderdates.json', 'utf8')
  global.itemwithdate = data
} catch (err) {
  
  global.errorcode = err.code
  global.errordesc = err
  
  console.error(err)
}
  
    fileslist.forEach(myFunction);
  
function myFunction(item, index) {
  
  const data = fs.readFileSync('/tmp/fileandfolderdates.json', 'utf8')
  
  const files = JSON.parse(data)
  
  //res.send(files["app"]["date"])

  
  const modifieddate = files[item.replace('/', '')]["modifieddate"].replace('GMT-0700 (Pacific Daylight Time)', 'PST')
  const createddate = files[item.replace('/', '')]["createddate"].replace('GMT-0700 (Pacific Daylight Time)', 'PST')
  const accesstime = files[item.replace('/', '')]["accesstime"].replace('GMT-0700 (Pacific Daylight Time)', 'PST')
  const filesize = files[item.replace('/', '')]["size"]
  const filepermission = files[item.replace('/', '')]["permissions"]

  global.filelist += `<a href="./${item}" class="button"><h3>${item}</h3><br>Created Date: ${createddate}<br>Modified Date: ${modifieddate}<br>Accessed Date: ${accesstime}<br>Size: ${filesize}<br>Permissions: ${filepermission}</button></a>`
  
  //        <button style="width: 100%;"><h3>Test</h3><br>Modified Date: </button>
  
  //${item} &nbsp; &nbsp; | &nbsp; M: ${dates} <br>
  //<a href="./${item}">${item}</a> &nbsp; &nbsp; | &nbsp; M: ${dates} <br>


  //return global.filelist
  
}

  //console.log(filesnodot)
  
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
  

app.get('/style.css', (req, res) => {

res.sendFile(__dirname + "/htdocs/style.css")

});

app.get('/', (req, res) => {

const names = `https://express-directory-listing.glitch.me/listfiles?path=${default_path}`

  const files_list = getList(default_path);  

got(`${names}`).then(r => {
let content = r.body


  res.render('index-new', {path: default_path, files: global.fileslistnone} );

}).catch(error => {

  console.log(`ERROR - ${error}`)
  
  return res.render('index-new', {path: ``, files: global.fileslistnone});
  
});
  
}); 




app.get('/listfiles', (req, res) => {
  
  const path = req.query.path

  
  const files_list = getList(path);
  
  return res.render('filelist', {files: files_list} );
  
  
  
});


app.get('/listing/*', (req, res, next) => {
  
  const path = req.originalUrl.replace("/listing/", "")

  
  const files_list = getList(path);
  
//Testing
 try { 
  
fs.readdirSync(defaultpath + "/" +path + "").forEach(file => {
  
  global.file = file
  
    if(fs.lstatSync(`${defaultpath}/${path}/${file}`).isDirectory() ) { 
      
      // if(file) {
      //  next(); 
      // } else {
  
        res.render('listing/index', {fileslist: global.fileslist, uptext: global.upone, path: global.path, errorcode: global.errorcode, errordesc: global.errordesc, embed: "None" });

      } else {
        
        if(!files_list || files_list.length === "0") {
          
        return res.render('listing/index', {files: files_list, uptext: global.upone, path: global.path, errorcode: global.errorcode, errordesc: global.errordesc, embed: "None" });
          
        }
  
        return res.render('listing/index', {files: files_list, uptext: global.upone, path: global.path, errorcode: global.errorcode, errordesc: global.errordesc, embed: "None" });
      
      }
        
})
  
   
 } catch (e) {
   
   console.error(`${e} \n\n ${e.code}`)
   
   if(e.code === "ENOENT") {
        
          res.render("listing/404", {files: files_list, uptext: global.upone, path: global.path, errorcode: global.errorcode, errordesc: global.errordesc, embed: "None" });
     
   } else {
     
     if(e.code === "ENOTDIR") {
       
             if(path.replace("/", "") === "server.js") {
        
          res.render("listing/403", {files: files_list, uptext: global.upone, path: global.path, errorcode: global.errorcode, errordesc: global.errordesc, embed: "None" });
        
      } else {
        
        if(path.includes("app/server.js")) {
          
          res.render("listing/403", {files: files_list, uptext: global.upone, path: global.path, errorcode: global.errorcode, errordesc: global.errordesc, embed: "None" });
          //res.render(`${defaultpath}/${path.replace("/", "")}`, { files: files_list })
          
        } else {
          
//res.sendFile(`${defaultpath}/${path.replace("/", "")}`)          
return res.render('listing/filecontent', {files: files_list, uptext: global.upone, path: global.path, errorcode: global.errorcode, errordesc: global.errordesc, embed: "None" });
        
        
        }
          
      }
        
        }
       
       
     }
     
   
     
   }
  
  //For empty directroies
   return res.render('listing/index', {files: files_list, uptext: global.upone, path: global.path, errorcode: global.errorcode, errordesc: global.errordesc, embed: "None" });
   
 });


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  //console.log("Your app is listening at " +listener.address().address +":" + listener.address().port);
});
