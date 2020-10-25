module.exports = {
    name: "links",
    aliases: ["invite"],
    category: "general",
    description: "Links!",
    usage: ["`-<command | alias> `"],
    run(bot, message, args) {
        const invite = bot.generateInvite({
            permissions: ["ADMINISTRATOR"],
        });

        console.log(invite);
    },
};
