const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

class CommitTreeCommand {
  constructor(tree, parent, message) {
    this.treeSHA = tree;
    this.parentSHA = parent;
    this.message = message;
  }

  execute() {
    const commitCotentBuffer = Buffer.concat([
      Buffer.from(`tree ${this.treeSHA}\n`),
      Buffer.from(`parent ${this.parentSHA}`),
      Buffer.from(
        `author Prajwal Meshram <prajwalmeshram1205@gmail.com> ${Date.now()} +0000\n`
      ),
      Buffer.from(`committer Prajwal Meshram <prajwalmeshram1205@gmail.com> ${Date.now()} +0000\n`),
      Buffer.from(`${this.message}`),
    ]);

    const header = `commit ${commitCotentBuffer.length}\0`;
    const data = Buffer.concat([Buffer.from(header), commitCotentBuffer]);
    
    const hash = crypto.createHash("sha1").update(data).digest("hex");

    const folder = hash.slice(0, 2);
    const file = hash.slice(2);

    const completeFolderPath = path.join(
        process.cwd(),
        ".git",
        "objects",
        folder,
    );

    if (!fs.existsSync(completeFolderPath)) fs.mkdirSync(completeFolderPath);
    
    const compressData = zlib.deflateSync(data);
  
    fs.writeFileSync(path.join(completeFolderPath, file), compressData);

    process.stdout.write(hash);
  }

}

module.exports = CommitTreeCommand;
