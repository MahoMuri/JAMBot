const { playlistInfo } = require("../../../functions");

module.exports = {
    name: "test",
    aliases: [""],
    category: "",
    description: "",
    usage: ["`-<command | alias> `"],
    run() {
        playlistInfo(process.env.YT_API, "PLDIoUOhQQPlXzhp-83rECoLaV6BwFtNC4")
            .then((playlistItems) => {
                console.log(playlistItems);
                console.log(playlistItems.length);
            })
            .catch(console.error);
    },
};
