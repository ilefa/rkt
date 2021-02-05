import { Message, Permissions, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../../command';
import {
    EmbedIconType,
    emboss,
    generateEmbed,
    generateSimpleEmbed
} from '../../../../../util';

enum SoundType {
    BONK = 'https://storage.googleapis.com/stonks-cdn/bonk.mp3',
    BOOM = 'https://storage.googleapis.com/stonks-cdn/boom.mp3',
    BRUH = 'https://storage.googleapis.com/stonks-cdn/bruh.mp3',
    CRAB = 'https://storage.googleapis.com/stonks-cdn/crab.mp3',
    CUT = 'https://storage.googleapis.com/stonks-cdn/cut.mp3',
    DERANGED = 'https://storage.googleapis.com/stonks-cdn/deranged.mp3',
    DISCORD = 'https://storage.googleapis.com/stonks-cdn/discord.mp3',
    FART = 'https://storage.googleapis.com/stonks-cdn/fart.mp3',
    FART2 = 'https://storage.googleapis.com/stonks-cdn/fart2.mp3',
    FNAF = 'https://storage.googleapis.com/stonks-cdn/fnaf.mp3',
    FRENCH = 'https://storage.googleapis.com/stonks-cdn/french.mp3',
    GUAC = 'https://storage.googleapis.com/stonks-cdn/guac.mp3',
    NIBBA = 'https://storage.googleapis.com/stonks-cdn/nibba.mp3',
    NIBBA2 = 'https://storage.googleapis.com/stonks-cdn/nibba2.mp3',
    PHONE = 'https://storage.googleapis.com/stonks-cdn/phone.mp3',
    QUIERES = 'https://storage.googleapis.com/stonks-cdn/quieres.mp3',
    WHAT = 'https://storage.googleapis.com/stonks-cdn/what.mp3',
    WOOOO = 'https://storage.googleapis.com/stonks-cdn/woooo.mp3',
    WOW = 'https://storage.googleapis.com/stonks-cdn/wow.mp3'
}

enum SoundVolume {
    BONK = 0.75,
    BOOM = 0.85,
    BRUH = 1.0,
    CRAB = 0.5,
    CUT = 0.45,
    DERANGED = 0.5,
    DISCORD = 1.0,
    FART = 1.0,
    FART2 = 0.85,
    FNAF = 0.70,
    FRENCH = 0.5,
    GUAC = 0.15,
    NIBBA = 0.75,
    NIBBA2 = 0.30,
    PHONE = 0.75,
    QUIERES = 0.75,
    WHAT = 0.75,
    WOOOO = 0.70,
    WOW = 0.75
}

const valid = [
    'bonk',
    'boom',
    'bruh',
    'crab',
    'cut',
    'deranged',
    'discord',
    'fart',
    'fart2',
    'fnaf',
    'french',
    'guac',
    'nibba',
    'nibba2',
    'phone',
    'quieres',
    'what',
    'woooo',
    'wow'
];

export default class SoundCommand extends Command {

    constructor() {
        super('sound', CommandCategory.AUDIO, `Invalid usage: ${emboss('.sound <type>')}`, null, [], Permissions.FLAGS.ADMINISTRATOR, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }

        let match: string = SoundType[args[0].toUpperCase()];
        if (!match) {
            message.reply(generateEmbed('Sounds', EmbedIconType.AUDIO, `Invalid sound: ${emboss(args[0])}`, [
                {
                    name: `Valid Sounds (${valid.length})`,
                    value: emboss(valid.join(', ')),
                    inline: false
                }
            ]));
            return CommandReturn.EXIT;
        }

        let vc = message.member.voice.channel;
        if (!vc) {
            message.reply(generateSimpleEmbed('Sounds', EmbedIconType.AUDIO, 'You must be in a voice channel to do this.'));
            return;
        }

        let permissions = vc.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            message.reply(generateSimpleEmbed('Sounds', EmbedIconType.AUDIO, `Insufficient privileges to join ${emboss(vc.name)}!`));
            return;
        }

        message.react('✅');

        vc
            .join()
            .then(connection => {
                let dispatcher = connection.play(match, {
                    volume: SoundVolume[args[0].toUpperCase()] || 0.75
                });

                dispatcher.on('finish', () => vc.leave());
            }).catch(err => {
                message.reply(generateEmbed('Sounds', EmbedIconType.AUDIO, 'An error occurred while playing sounds.', [
                    {
                        name: 'Stack',
                        value: err,
                        inline: false
                    }
                ]));
            });

        return CommandReturn.EXIT;
    }

}