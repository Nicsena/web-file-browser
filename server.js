require('dotenv').config()

const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const port = process.env.PORT || "3000";
const blacklistedfiles = require("./blacklisted.json");
const verbose = process.env.VERBOSE || "false";
const logrequests = process.env.LOGREQUESTS || "false"
let requests = 1;

const defaultPath = "/";


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

  try {
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    let list = [];

    // Read Directory and Loop through files.
    items.forEach((item) => {
      // Don't add files/directories that is in the blacklist.
      if (blacklistedfiles.includes(item.name)) {
        if (item.isDirectory()) return console.log(`Blacklisted Folder: ${item.name}`);
        if (item.isFile()) return console.log(`Blacklisted File: ${item.name}`);
        if (item.isSymbolicLink()) return console.log(`Blacklisted Symbolic Link: ${item.name}`);
      }

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

    return { path: "/", list: list };


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

    if (error.code === "ENOTDIR") {
      console.log(`ENOTDIR: Not a directory - Path: ${fullPath}`);
      return "ENOTDIR";
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

  if(verbose === "true") console.log(`File: ${fullPath}\nContent: ${content}`)

  try {
    const file = fs.writeFileSync(fullPath, content);
    return "";

  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`ENOENT: File Not Found - Path: ${fullPath}`);
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





// =================== Express Web Server ===================

app.use(express.static("public"));
app.enable("trust proxy");


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
// This returns JSON result with files and directories
// of a directory.
//
// Example:
// http://127.0.0.1:3000/files?directory=/
// ======================================================
app.get("/files", async (req, res) => {
  const directory = path.join(req.query.directory);
  const list = await getFiles(directory);

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

  res.status(200).json(list);
});



// ======================================================
// Files Endpoint: /files/content
// This endpoint returns contents of a file.
//
// Example:
// http://127.0.0.1:3000/files/content?file=/hello.txt
// ======================================================
app.get("/files/content", async (req, res) => {
  const file = req.query.file;
  const content = GetFileContent(file);

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

  if (content === "ENOTDIR") {
    return res.status(404).json({
      path: file,
      code: 404,
      message: `Error 404`
    });
  }

  res.header("Content-Type", "text/plain;charset=UTF-8");
  res.status(200).send(content);
});





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
