const ms = require("ms");

let timer;

module.exports = (bot) => {
    bot.on("voiceStateUpdate", (oldState, newState) => {
        const server = bot.servers[newState.guild.id || oldState.guild.id];
        if (oldState.member.user === bot.user) {
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

                    if (!server.channel.text.deleted)
                        server.channel.text.send(
                            "**👋 Successfully Disconnected!**"
                        );
                    console.log(
                        "**👋 Successfully Disconnected!**",
                        server.queue
                    );
                } else if (server) {
                    if (server.channel.text) {
                        console.log(server.channel.text.name);
                        if (
                            oldState.guild.channels.resolve(server.channel.text)
                        )
                            server.channel.text
                                .send("**👋 Successfully Disconnected!**")
                                .catch(console.error);
                    }

                    console.log(
                        "**👋 Successfully Disconnected!**",
                        server.channel.text.deleted
                    );
                }
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
        } else if (server && oldState.channel === server.channel.voice) {
            const members = server.channel.voice.members.map(
                (member) => member
            );
            if (members.length === 1)
                if (members[0].user === bot.user) {
                    console.log(
                        "All members are in a different Voice Channel!"
                    );
                    timer = setTimeout(() => {
                        server.channel.voice.leave();
                    }, ms("1m"));
                }
        } else if (server && newState.channel === server.channel.voice) {
            const members = server.channel.voice.members.map(
                (member) => member
            );
            if (members.length > 1) {
                console.log("Timer cleared");
                clearTimeout(timer);
            }
        }
    });
};
