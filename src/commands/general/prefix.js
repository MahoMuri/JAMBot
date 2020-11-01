const { MessageEmbed } = require("discord.js");

const fs = require("fs");

const colors = require("../../../colors.json");

const prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));

module.exports = {
    name: "prefix",
    aliases: [""],
    category: "general",
    description:
        "Displays the prefix of this server or changes the prefix of this server",
    usage: ["`-<command | alias> <desired prefix>`"],
    run(bot, message, args) {
        // checks if mode is true
        if (args.length !== 0) {
            const mode = args[0].toString().toLowerCase();
            // checks if mode is equal to set
            if (mode === "set") {
                if (!message.member.hasPermission("MANAGE_GUILD"))
                    return message.reply(
                        "You don't have the permission to do this!"
                    );

                // checks for prefix to be given
                if (!args[1])
                    return message.channel.send("You must provide a prefix!");

                prefixes[message.guild.id] = {
                    prefix: args[1],
                };

                fs.writeFileSync(
                    "./prefixes.json",
                    JSON.stringify(prefixes, null, "\t"),
                    (err) => {
                        if (err) console.error(err);
                    }
                );

                const sEmbed = new MessageEmbed()
                    .setColor(colors.Green_Sheen)
                    .setTitle("Prefix Set!")
                    .setDescription(`Server's prefix is set to \`${args[1]}\``);

                message.channel.send(sEmbed);
            } else
                return message.channel.send(
                    `**I don't know the command** \`${mode}\``
                );
        } else {
            const pEmbed = new MessageEmbed()
                .setColor(colors.Dark_Pastel_Blue)
                .setTitle("Server's Prefix").setDescription(`**Prefix is \`${
                prefixes[message.guild.id].prefix
            }\`**
                Type \`${
                    prefixes[message.guild.id].prefix
                }prefix set <prefix here>\` to change this server's prefix!`);
            message.channel.send(pEmbed);
        }
    },
};
