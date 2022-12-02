const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const port = process.env.PORT || "3000";
const blacklistedfiles = require("./blacklisted.json");
const verbose = process.env.VERBOSE || "false";

const defaultPath = "/";

// ---- Functions -----

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getFiles(directory) {
  const fullPath = path.join(defaultPath + path.resolve(directory) + "/");

  console.log(fullPath);

  //console.log(fullPath.substring(0, defaultPath.length) !== defaultPath)

  // if(fullPath.substring(0, defaultPath.length) !== defaultPath) {
  //    return getFiles("/")
  //   }

  try {
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    let list = [];

    // Read Directory and Loop through files.
    items.forEach((item) => {
      // Don't add files/directories that is in the blacklist.
      if (blacklistedfiles.includes(item.name)) {
        if (item.isDirectory())
          return console.log(`Blacklisted Folder: ${item.name}`);
        if (item.isFile()) return console.log(`Blacklisted File: ${item.name}`);
        if (item.isSymbolicLink())
          return console.log(`Blacklisted Symbolic Link: ${item.name}`);
      }

      // Get Stats for and push them to a array.
      const iteminfo = fs.statSync(fullPath + item.name);
      const json = {
        name: item.name,
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

function GetFileContent(file) {
  const fullPath = path.join(defaultPath, path.resolve(file));

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

// ---- Express Web Server -----

app.use(express.static("public"));
app.enable("trust proxy");

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/files", async (req, res) => {
  const path = req.query.directory;
  const list = getFiles(path);

  if (list === "ENOENT")
    return res.status(404).json({
      path: path,
      code: 404,
      message: `Directory doesn't exist`,
    });

  if (list === "EACCES")
    return res.status(403).json({
      path: path,
      code: 403,
      message: `Forbidden`,
    });

  if (list === "ENOTDIR")
    return res.status(404).json({
      path: path,
      code: 404,
      message: `Error 404`,
    });

  res.status(200).json(list);
});

app.get("/files/content", async (req, res) => {
  const file = req.query.file;
  const content = GetFileContent(file);

  if (content === "ENOENT")
    return res.status(404).json({
      path: path,
      code: 404,
      message: `File doesn't exist`,
    });

  if (content === "EACCES")
    return res.status(403).json({
      path: path,
      code: 403,
      message: `Forbidden`,
    });

  if (content === "ENOTDIR")
    return res.status(404).json({
      path: path,
      code: 404,
      message: `Error 404`,
    });

  res.header("Content-Type", "text/plain;charset=UTF-8");
  res.status(200).send(content);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
