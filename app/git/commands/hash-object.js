const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const crypto = require("crypto");

class HashObjectCommand {
  constructor(flag, filepath) {
    this.flag = flag;
    this.filepath = filepath;
  }

  execute() {
    //Make sure that file is there
    const filepath = path.resolve(this.filepath);

    if (!fs.existsSync(filepath))
      throw new Error(
        `Could not open '${this.filepath}' for reading: No such file or directory`
      );

    //read the file
    const fileContents = fs.readFileSync(filepath);
    const fileLength = fileContents.length;

    //create the blob
    const header = `blob ${fileLength}\0`;
    const blob = Buffer.concat([Buffer.from(header), fileContents]);

    //compress the hash
    //calculate hash
    const hash = crypto.createHash("sha1").update(blob).digest("hex");
    // console.log(hash);

    //if -w then write the file also (compress)
    if (this.flag && this.flag == "-w") {
      const folder = hash.slice(0, 2);
      const file = hash.slice(2);

      const completeFolderPath = path.join(
        process.cwd(),
        ".git",
        "objects",
        folder
      );
      if (!fs.existsSync(completeFolderPath)) fs.mkdirSync(completeFolderPath);

      const compressData = zlib.deflateSync(blob);

      fs.writeFileSync(path.join(completeFolderPath, file), compressData);
    }

    process.stdout.write(hash);
  }
}

module.exports = HashObjectCommand;
