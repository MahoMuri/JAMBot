module.exports = {
    name: "join",
    aliases: ["j"],
    category: "music",
    description: "Makes the bot join your voice channel",
    usage: ["`-<command | alias> `"],
    async run(bot, message) {
        if (message.member.voice.channel) {
            if (!bot.servers[message.guild.id])
                bot.servers[message.guild.id] = {
                    name: message.guild.name,
                    loop: {
                        song: false,
                        queue: false,
                    },
                    queue: [],
                };

            const server = await bot.servers[message.guild.id];

            const connectedChannel = bot.voice.connections.map(
                (connection) => connection.channel
            );
            const guildCheck = bot.voice.connections.map(
                (connection) => connection.channel.guild.id
            );
            // console.log(guildCheck);

            if (!guildCheck.includes(message.guild.id)) {
                const connection = await message.member.voice.channel.join();
                server.channel = {
                    text: message.channel,
                    voice: connection.channel,
                };
            } else if (
                !connectedChannel.includes(message.member.voice.channel)
            ) {
                const guilds = connectedChannel.map((channel) => {
                    let servers = {};
                    const guild = channel.guild.name;
                    const members = channel.members.map(
                        (member) => member.user.username
                    );
                    servers = {
                        guild,
                        members: members.filter(
                            (name) => name !== bot.user.username
                        ),
                    };
                    return servers;
                });

                const guild = guilds.find(
                    (member) => member.guild === message.guild.name
                );

                console.log(guild);

                if (guild && guild.members.length === 0) {
                    const connection = await message.member.voice.channel.join();
                    server.channel = {
                        text: message.channel,
                        voice: connection.channel,
                    };
                } else if (guild && guild.members.length > 0)
                    return message.channel.send(
                        "❌ **I'm already being used in a different channel!**"
                    );
            } else {
                const connection = await message.member.voice.channel.join();
                server.channel = {
                    text: message.channel,
                    voice: connection.channel,
                };
            }
        } else
            return message.channel.send(
                "❌ **You're not in a Voice Channel, Please join one first!**"
            );
    },
};
