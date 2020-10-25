const ms = require("ms");

module.exports = (bot) => {
    bot.on("voiceStateUpdate", async (oldState, newState) => {
        if (oldState.member.user === bot.user) {
            const server = bot.servers[newState.guild.id || oldState.guild.id];

            if (!oldState.channel && newState.channel) {
                console.log("this one");
                server.channel.text.send(
                    `✅ **Joined ${newState.channel.name} Channel!**`
                );
            } else if (oldState.channel && !newState.channel) {
                console.log("that one");
                if (server) {
                    if (server.dispatcher && server.queue.length !== 0) {
                        await server.queue.splice(0, server.queue.length);
                        server.dispatcher.destroy();
                    } else if (server.queue.length !== 0)
                        server.queue.splice(0, server.queue.length);
                    server.channel.text.send(
                        "**👋 Successfully Disconnected!**"
                    );
                    console.log(server.queue);
                }
            } else if (
                oldState.channel !== newState.channel &&
                newState !== null
            )
                if (server) {
                    if (server.dispatcher && server.queue.length !== 0) {
                        await server.queue.splice(0, server.queue.length);
                        server.dispatcher.destroy();
                    } else if (server.queue.length !== 0)
                        server.queue.splice(0, server.queue.length);
                    server.channel.text.send(
                        "**👋 Successfully Disconnected!**"
                    );
                    console.log(server.queue);
                }
        } else if (
            oldState.member.user !== bot.user &&
            oldState.channel &&
            !newState.channel
        )
            if (oldState)
                setInterval(() => {
                    const members = oldState.channel.members.map(
                        (member) => member
                    );
                    if (members.length === 1)
                        if (members[0].user === bot.user)
                            members[0].voice.channel.leave();
                }, ms("5m"));
    });
};
