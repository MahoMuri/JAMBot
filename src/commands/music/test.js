// const Pagination = require("discord-paginationembed");
// const { MessageEmbed } = require("discord.js");
// const { shuffle } = require("fast-shuffle");
// const { google } = require("googleapis");

// const fs = require("fs");

module.exports = {
    name: "test",
    aliases: [""],
    category: "",
    description: "",
    usage: ["`-<command | alias> `"],
    run(bot, message) {
        // const server = await bot.servers[message.guild.id];

        // message.channel.send(`Test Message `);
        const oldMessage = message.channel.messages.cache.find(
            (message) =>
                message.author.id === bot.user.id &&
                message.embeds.find(
                    (embed) => embed.title === "**Now playing:**"
                )
        );
        // let embeds = oldMessage.embeds.find(embed => embed.title === '**Now playing:**');
        if (!oldMessage) console.log("No message found");
        else
            console.log(
                oldMessage.embeds.find(
                    (embed) => embed.title === "**Now playing:**"
                )
            );

        // let readableStream = fs.createReadStream('https://open.spotify.com/track/3tjFYV6RSFtuktYl3ZtYcq?si=pZLdJ6SMSAGnF1LMVu_c6A');
        // readableStream.on('error', console.error);
        // console.log(readableStream);
        // console.log(server.queue[0]);
        // const shuffledList = shuffle(server.queue.slice(1));
        // const suits = ['♣', '♦', '♥', '♠'];
        // const faces = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        // const sortedDeck = suits.map((suit) => faces.map((face) => face + suit)).flat();
        // // [ '2♣', '3♣', '4♣', '5♣', '6♣', '7♣', '8♣', ...
        // const shuffledDeck = shuffle(sortedDeck);

        // const sortedList = server.owner.map((owner) => server.info.map((info) => server.queue.map((queue) => queue + info + owner))).flat();

        // const embeds = [];

        // for (let i = 1; i <= 5; ++i){
        //     embeds.push(new MessageEmbed().setDescription(`Page ${i}`));
        // }

        // const myImage = message.author.displayAvatarURL();

        // new Pagination.Embeds()
        //   .setArray(embeds)
        //   .setAuthorizedUsers([message.author.id])
        //   .setChannel(message.channel)
        //   .setPageIndicator(true)
        //   .setPage(3)
        //    // Methods below are for customising all embeds
        //   .setImage(myImage)
        //   .setThumbnail(myImage)
        //   .setTitle('Test Title')
        //   .setFooter('Test Footer Text')
        //   .setURL(myImage)
        //   .setColor(0xFF00AE)
        //   .addField('\u200b', '\u200b')
        //   .addField('Test Field 1', 'Test Field 1', true)
        //   .addField('Test Field 2', 'Test Field 2', true)
        //   .build();

        // console.log(Math.round(Math.random() * Math.floor(100)));
    },
};
