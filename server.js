require('dotenv').config()

const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const bodyParser = require('body-parser')
const port = process.env.PORT || "3000";
const verbose = process.env.VERBOSE || "false";
const logrequests = process.env.LOGREQUESTS || "false"
const ReadOnlyMode = process.env.READONLY || "false"
let requests = 1;

const defaultPath = __dirname + "/";


// =================== Functions ===================

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}


// ======================================================
// This function returns a json array of files and directories
// in a directory along with some information about them.
//
// Example:
// getFiles("/")
// ======================================================
async function getFiles(directory) {
  const fullPath = path.join(defaultPath + path.resolve(directory) + "/");
  
  if(verbose === "true") console.log(`Directory: ${fullPath}`);

  if(directory.substr(0, 1) !== "/") return "FAILED"

  try {
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    let list = [];

    // Read Directory and Loop through files.
    items.forEach((item) => {

      // Get Stats for and push them to a array.
      const iteminfo = fs.statSync(fullPath + item.name);
      const json = {
        name: item.name,
        path: fullPath + item.name,
        attributes: {
          mode: (iteminfo.mode & parseInt("777", 8)).toString(8),
          mode_bits: iteminfo.mode,
          size: formatBytes(iteminfo.size),
          is_file: iteminfo.isFile(),
          is_symlink: iteminfo.isSymbolicLink(),
          mimetype: "",
          created_at: iteminfo.birthtime,
          modified_at: iteminfo.mtime,
        },
      };

      list.push(json);
    });

    return { path: path.resolve(directory), list: list };


  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`ENOENT: Directory Not Found - Path: ${fullPath}`);
      return "ENOENT";
    }

    if (error.code === "EACCES") {
      console.log(`EACCES: Permission denied - Path: ${fullPath}`);
      return "EACCES";
    }

    if (error.code === "ENOTDIR") {
      console.log(`ENOTDIR: Not a directory - Path: ${fullPath}`);
      return "ENOTDIR";
    }

    console.error(error);
  }
}



// ======================================================
// This function returns the content of a specified file.
//
// Example:
// GetFileContent("/hello.txt")
// ======================================================
async function GetFileContent(file) {
  const fullPath = path.join(defaultPath, path.resolve(file));


  if(verbose === "true") console.log(`File: ${fullPath}`)

  try {
    const content = fs.readFileSync(fullPath, "utf8");
    return content.toString("utf8");

  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`ENOENT: File Not Found - Path: ${fullPath}`);
      return "ENOENT";
    }

    if (error.code === "EACCES") {
      console.log(`EACCES: Permission denied - Path: ${fullPath}`);
      return "EACCES";
    }

    if (error.code === "EISDIR") {
      console.log(`EISDIR: Not a directory - Path: ${fullPath}`);
      return "EISDIR";
    }

    console.error(error);
  }
}




// ======================================================
// This function writes to a specified file with 
// specified content.
//
// Example:
// writeContentToFile("/hello.txt", "Content of the file")
// ======================================================
async function writeContentToFile(file, content) {
  const fullPath = path.join(defaultPath, path.resolve(file));

  if(ReadOnlyMode === "true") return "READONLY-MODE-ENABLED";

  if(verbose === "true") console.log(`File: ${fullPath}\nContent: ${content}`);

  if(file.substr(0, 1) !== "/") return "FAILED"

  try {

    if (!fs.existsSync(fullPath)){
      fs.writeFileSync(fullPath, decodeURIComponent(content), { encoding: "utf8", flag: 'w'});
      return "NewFile-Success"
    }

    return "Success";

  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`ENOENT: File Not Found - Path: ${fullPath}`);
      return "ENOENT";
    }

    if (error.code === "EACCES") {
      console.log(`EACCES: Permission denied - Path: ${fullPath}`);
      return "EACCES";
    }

    if (error.code === "EISDIR") {
      console.log(`EISDIR: illegal operation on a directory - Path: ${fullPath}`);
      return "EISDIR";
    }

    console.error(error);
  }
}





// ======================================================
// This function makes a new spcified directory.
//
// Example:
// makeNewFolder("/example")
// ======================================================
async function makeNewFolder(folder) {
  const fullPath = path.join(defaultPath, path.resolve(folder));

  if(ReadOnlyMode === "true") return "READONLY-MODE-ENABLED";

  if(verbose === "true") console.log(`Folder: ${fullPath}`);

  if(folder.substr(0, 1) !== "/") return "FAILED"

  try {

    if (!fs.existsSync(fullPath)){
      fs.mkdirSync(fullPath, { recursive: true });
      return "Success"
    }

    return "Existing";

  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`ENOENT: Folder Not Found - Path: ${fullPath}`);
      return "ENOENT";
    }

    if (error.code === "EACCES") {
      console.log(`EACCES: Permission denied - Path: ${fullPath}`);
      return "EACCES";
    }


    console.error(error);
  }
}







// ======================================================
// This function deletes a specified file/directory.
//
// Example:
// deleteFileDirectory("/example")
// ======================================================
async function deleteFileDirectory(file) {
  const fullPath = path.join(defaultPath, path.resolve(file));

  if(ReadOnlyMode === "true") return "READONLY-MODE-ENABLED";

  if(verbose === "true") console.log(`File/Directory: ${fullPath}`);

  if(file.substr(0, 1) !== "/") return "FAILED"

  try {

    if (fs.existsSync(fullPath)){

      const item = fs.statSync(fullPath);
      if(item.isFile() === true) {
        await fs.unlinkSync(fullPath)
        if(verbose === "true") { console.log (`Deleted File: ${file} - Path: ${fullPath}`)}
        return "Success"
      }

      if(item.isSymbolicLink() === true) {
        await fs.unlinkSync(fullPath)
        if(verbose === "true") { console.log (`Deleted Symbolic Link: ${file} - Path: ${fullPath}`)}
        return "Success"
      }
      
      if(item.isDirectory() === true) {
        await fs.rmSync(fullPath, { recursive: true })
        if(verbose === "true") { console.log (`Deleted Folder: ${file} - Path: ${fullPath}`)}
        return "Success"
      }

      return "FAILED"

    }

    return "ENOENT";

  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`ENOENT: Folder Not Found - Path: ${fullPath}`);
      return "ENOENT";
    }

    if (error.code === "EACCES") {
      console.log(`EACCES: Permission denied - Path: ${fullPath}`);
      return "EACCES";
    }

    if (error.code === "EISDIR") {
      console.log(`EISDIR: illegal operation on a directory - Path: ${fullPath}`);
      return "EISDIR";
    }


    console.error(error);
  }
}










// =================== Express Web Server ===================

app.use(express.static("public"));
app.enable("trust proxy");
app.use(bodyParser.json({ extended: false })); 


app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});



app.get("*", (req, res, next) => {

  if(logrequests === "true") {
  //const IP = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'].split(",")[0] || req.ip;
  const IP = req.ip
  var time = new Date();
  var timestring = time.toLocaleTimeString();
  const UserAgent = `${req.get('User-Agent')}` || `No User Agent!`
  const Path = req.path
  const Params = JSON.stringify(req.query)
  const Method = req.method
  const Version = req.httpVersion
  const Host = req.hostname
  const Referer = req.get('referer') || "None";

  console.log(`[${timestring}] [${requests++}] [Method: ${Method}] [HTTP ${Version}] [IP: ${IP}] [Path: ${Path}] [Params: ${Params}] [Referer: ${Referer}] [User Agent: ${UserAgent}]`); 

  }

  next();

});




app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});





// ======================================================
// Files Endpoint: /files
// Method: GET
// This returns JSON result with files and directories
// of a directory.
//
// Example:
// http://127.0.0.1:3000/files?directory=/
// ======================================================
app.get("/files", async (req, res) => {
  const directory = path.join(req.query.directory);
  const list = await getFiles(directory);
  res.header('Content-Type', 'application/json');

  if (list === "ENOENT") {
    return res.status(404).json({
      path: directory,
      code: 404,
      message: `Directory doesn't exist`
    });
  }

  if (list === "EACCES") {
    return res.status(403).json({
      path: directory,
      code: 403,
      message: `Forbidden`
    });
  }

  if (list === "ENOTDIR") {
    return res.status(404).json({
      path: directory,
      code: 404,
      message: `Error 404`
    });
  }

  if (list === "FAILED") {
    return res.status(500).json({
      path: directory,
      code: 500,
      message: `Internal Server Error`
    });
  }

  res.status(200).json(list);
});



// ======================================================
// Files Endpoint: /files/content
// Method: GET
// This endpoint returns contents of a file.
//
// Example:
// http://127.0.0.1:3000/files/content?file=/hello.txt
// ======================================================
app.get("/files/content", async (req, res) => {
  const file = path.join(req.query.file);
  const content = await GetFileContent(file);

  if (content === "ENOENT") {
    return res.status(404).json({
      path: file,
      code: 404,
      message: `File doesn't exist`
    });
  }

  if (content === "EACCES") {
    return res.status(403).json({
      path: file,
      code: 403,
      message: `Forbidden`
    });
  }

  if (result === "EISDIR") {
    return res.status(500).json({
      path: file,
      code: 500,
      message: `Internal Server Error`
    });
  }

  res.header("Content-Type", "text/plain;charset=UTF-8");
  res.status(200).send(content);
});


// ======================================================
// Files Endpoint: /files/write
// Method: POST
// This endpoint is to write content to a file.
//
// ======================================================
app.post("/files/write", async (req, res) => {
  const file = req.query.file;
  const content = req.body.content;
  const result = await writeContentToFile(file, content);

  if (ReadOnlyMode === "true") {
    return res.status(409).json({
      path: file,
      code: 409,
      message: `Read-Only Mode is enabled. Unable to write to file.`
    });
  }

  if (result === "NewFile-Success") {
    return res.status(201).json({
      path: file,
      code: 201,
      message: `Successfully made a new file and wrote to file!`
    });
  }

  if (result === "Success") {
    return res.status(200).json({
      path: file,
      code: 200,
      message: `Successfully updated file!`
    });
  }

  if (result === "FAILED") {
    return res.status(500).json({
      path: file,
      code: 500,
      message: `Internal Server Error`
    });
  }


  if (result === "ENOENT") {
    return res.status(404).json({
      path: file,
      code: 404,
      message: `File doesn't exist`
    });
  }

  if (result === "EACCES") {
    return res.status(403).json({
      path: file,
      code: 403,
      message: `Forbidden`
    });
  }

  if (result === "EISDIR") {
    return res.status(500).json({
      path: file,
      code: 500,
      message: `Internal Server Error`
    });
  }

  res.header("Content-Type", "text/plain;charset=UTF-8");
  res.status(200).send(result);
});





// ======================================================
// Files Endpoint: /files/create-folder
// Method: POST
// This endpoint is to make a new folder in a specific directory
//
// ======================================================
app.post("/files/create-folder", async (req, res) => {
  const folder = req.query.folder;
  const result = await makeNewFolder(folder);

  if (ReadOnlyMode === "true") {
    return res.status(409).json({
      path: file,
      code: 409,
      message: `Read-Only Mode is enabled. Unable to make a new folder.`
    });
  }

  if (result === "Existing") {
    return res.status(204).json({
      path: folder,
      code: 204,
      message: `The folder already exists.`
    });
  }

  if (result === "Success") {
    return res.status(200).json({
      path: folder,
      code: 200,
      message: `Successfully made a new folder!`
    });
  }

  if (result === "FAILED") {
    return res.status(500).json({
      path: folder,
      code: 500,
      message: `Internal Server Error`
    });
  }

  if (result === "ENOENT") {
    return res.status(404).json({
      path: folder,
      code: 404,
      message: `Folder doesn't exist`
    });
  }

  if (result === "EACCES") {
    return res.status(403).json({
      path: folder,
      code: 403,
      message: `Forbidden`
    });
  }

  if (result === "EISDIR") {
    return res.status(500).json({
      path: folder,
      code: 500,
      message: `Internal Server Error`
    });
  }

  res.header("Content-Type", "text/plain;charset=UTF-8");
  res.status(200).send(result);
});




// ======================================================
// Files Endpoint: /files/delete
// Method: POST
// This endpoint is to write delete a fire/directory
//
// ======================================================
app.post("/files/delete", async (req, res) => {
  const file = req.query.file;

  const result = await deleteFileDirectory(file);

  if (ReadOnlyMode === "true") {
    return res.status(409).json({
      path: file,
      code: 409,
      message: `Read-Only Mode is enabled. Unable to delete file/directory.`
    });
  }


  if (result === "Success") {
    return res.status(200).json({
      path: file,
      code: 200,
      message: `Successfully deleted file/directory`
    });
  }

  if (result === "FAILED") {
    return res.status(500).json({
      path: file,
      code: 500,
      message: `Internal Server Error`
    });
  }


  if (result === "ENOENT") {
    return res.status(404).json({
      path: file,
      code: 404,
      message: `File/Directory doesn't exist.`
    });
  }

  if (result === "EACCES") {
    return res.status(403).json({
      path: file,
      code: 403,
      message: `Forbidden`
    });
  }

  if (result === "EISDIR") {
    return res.status(500).json({
      path: file,
      code: 500,
      message: `Internal Server Error`
    });
  }

  res.header("Content-Type", "text/plain;charset=UTF-8");
  res.status(200).send(result);

});














app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
