const ms = require("ms");

module.exports = (bot) => {
    bot.on("voiceStateUpdate", (oldState, newState) => {
        if (oldState.member.user === bot.user) {
            const server = bot.servers[newState.guild.id || oldState.guild.id];

            if (!oldState.channel && newState.channel) {
                console.log("this one");
                server.channel.text.send(
                    `✅ **Joined ${newState.channel.name} Channel!**`
                );
            } else if (oldState.channel && !newState.channel) {
                console.log("that one");
                if (server && server.dispatcher) {
                    if (server.loop.song || server.loop.queue)
                        server.loop = {
                            song: false,
                            queue: false,
                        };
                    if (server.dispatcher && server.queue.length !== 0) {
                        server.queue.length = 0;
                        server.dispatcher.end();
                    } else if (server.queue.length !== 0)
                        server.queue.length = 0;
                    server.channel.text.send(
                        "**👋 Successfully Disconnected!**"
                    );
                    console.log(
                        "**👋 Successfully Disconnected!**",
                        server.queue
                    );
                } else
                    server.channel.text.send(
                        "**👋 Successfully Disconnected!**"
                    );
            } else if (
                oldState.channel !== newState.channel &&
                newState !== null
            )
                if (server && server.dispatcher) {
                    if (server.dispatcher && server.queue.length !== 0) {
                        server.queue.length = 0;
                        server.dispatcher.end();
                    } else if (server.queue.length !== 0)
                        server.queue.length = 0;
                    server.channel.text.send(
                        `✅ **Joined ${newState.channel.name} Channel!**`
                    );
                }
        } else if (
            oldState.member.user !== bot.user &&
            oldState.channel &&
            !newState.channel
        )
            if (oldState && oldState.channel)
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
