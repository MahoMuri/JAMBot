const { getMember } = require("../../../functions.js");

module.exports = {
    name: "hi",
    aliases: ["hey", "hello"],
    category: "general",
    description: "Replies Hello",
    usage: ["`-<command | alias>`"],
    async run(bot, message, args) {
        const member = getMember(message, args.join(" "));

        const nsg = await message.channel.send(`Hello ${member}!`);
        nsg.delete({ timeout: 5000, reason: "It had to be done." });
        message.delete({ timeout: 5000, reason: "It had to be done." });
    },
};
