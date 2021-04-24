import { EmbedIconType } from '../../../../util';
import { Message, Permissions, User } from 'discord.js';
import { Command, CommandReturn, emboss } from '@ilefa/ivy';

enum SoundType {
    AMOGUS = 'https://storage.googleapis.com/stonks-cdn/amogus.mp3',
    AMONGSUS = 'https://storage.googleapis.com/stonks-cdn/amongsus.mp3',
    BONK = 'https://storage.googleapis.com/stonks-cdn/bonk.mp3',
    BOOM = 'https://storage.googleapis.com/stonks-cdn/boom.mp3',
    BRITISH = 'https://storage.googleapis.com/stonks-cdn/british.mp3',
    BRUH = 'https://storage.googleapis.com/stonks-cdn/bruh.mp3',
    CSGODMF = 'https://storage.googleapis.com/stonks-cdn/csgodmf.mp3',
    CSGODMF2 = 'https://storage.googleapis.com/stonks-cdn/csgodmf2.mp3',
    CSWOMEN = 'https://storage.googleapis.com/stonks-cdn/cswomen.mp3',
    CRAB = 'https://storage.googleapis.com/stonks-cdn/crab.mp3',
    CUT = 'https://storage.googleapis.com/stonks-cdn/cut.mp3',
    DERANGED = 'https://storage.googleapis.com/stonks-cdn/deranged.mp3',
    DISCORD = 'https://storage.googleapis.com/stonks-cdn/discord.mp3',
    DOLLA = 'https://storage.googleapis.com/stonks-cdn/dolla.mp3',
    DREAM = 'https://storage.googleapis.com/stonks-cdn/dream.mp3',
    FART = 'https://storage.googleapis.com/stonks-cdn/fart.mp3',
    FART2 = 'https://storage.googleapis.com/stonks-cdn/fart2.mp3',
    FNAF = 'https://storage.googleapis.com/stonks-cdn/fnaf.mp3',
    FRENCH = 'https://storage.googleapis.com/stonks-cdn/french.mp3',
    GUAC = 'https://storage.googleapis.com/stonks-cdn/guac.mp3',
    LESGO = 'https://storage.googleapis.com/stonks-cdn/lesgo.mp3',
    NIBBA = 'https://storage.googleapis.com/stonks-cdn/nibba.mp3',
    NIBBA2 = 'https://storage.googleapis.com/stonks-cdn/nibba2.mp3',
    OMG = 'https://storage.googleapis.com/stonks-cdn/omg.mp3',
    PHONE = 'https://storage.googleapis.com/stonks-cdn/phone.mp3',
    QUIERES = 'https://storage.googleapis.com/stonks-cdn/quieres.mp3',
    SUSSY = 'https://storage.googleapis.com/stonks-cdn/sussy.mp3',
    WHAT = 'https://storage.googleapis.com/stonks-cdn/what.mp3',
    WOOOO = 'https://storage.googleapis.com/stonks-cdn/woooo.mp3',
    WOW = 'https://storage.googleapis.com/stonks-cdn/wow.mp3'
}

enum SoundVolume {
    AMOGUS = 0.5,
    AMONGSUS = 0.5,
    BONK = 0.75,
    BOOM = 0.85,
    BRITISH = 0.75,
    BRUH = 1.0,
    CSGODMF = 0.75,
    CSGODMF2 = 0.75,
    CSWOMEN = 0.75,
    CRAB = 0.5,
    CUT = 0.45,
    DERANGED = 0.5,
    DISCORD = 1.0,
    DOLLA = 0.75,
    DREAM = 0.75,
    FART = 1.0,
    FART2 = 0.85,
    FNAF = 0.70,
    FRENCH = 0.5,
    GUAC = 0.15,
    LESGO = 0.75,
    NIBBA = 0.75,
    NIBBA2 = 0.30,
    OMG = 0.75,
    PHONE = 0.75,
    QUIERES = 0.75,
    SUSSY = 0.75,
    WHAT = 0.75,
    WOOOO = 0.70,
    WOW = 0.75
}

const valid = [
    'amogus',
    'amongsus',
    'bonk',
    'boom',
    'british',
    'bruh',
    'csgodmf',
    'csgodmf2',
    'cswomen',
    'crab',
    'cut',
    'deranged',
    'discord',
    'dolla',
    'dream',
    'fart',
    'fart2',
    'fnaf',
    'french',
    'guac',
    'lesgo',
    'nibba',
    'nibba2',
    'omg',
    'phone',
    'quieres',
    'sussy',
    'what',
    'woooo',
    'wow'
];

export class SoundCommand extends Command {

    constructor() {
        super('sound', `Invalid usage: ${emboss('.sound <type>')}`, null, [], Permissions.FLAGS.ADMINISTRATOR, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }

        let match: string = SoundType[args[0].toUpperCase()];
        if (!match) {
            message.reply(this.embeds.build('Sounds', EmbedIconType.AUDIO, `Invalid sound: ${emboss(args[0])}`, [
                {
                    name: `Valid Sounds (${valid.length})`,
                    value: emboss(valid.join(', ')),
                    inline: false
                }
            ], message));
            return CommandReturn.EXIT;
        }

        let vc = message.member.voice.channel;
        if (!vc) {
            message.reply(this.embeds.build('Sounds', EmbedIconType.AUDIO, 'You must be in a voice channel to do this.', null, message));
            return;
        }

        let permissions = vc.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            message.reply(this.embeds.build('Sounds', EmbedIconType.AUDIO, `Insufficient privileges to join ${emboss(vc.name)}!`, null, message));
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
                message.reply(this.embeds.build('Sounds', EmbedIconType.AUDIO, 'An error occurred while playing sounds.', [
                    {
                        name: 'Stack',
                        value: err,
                        inline: false
                    }
                ], message));
            });

        return CommandReturn.EXIT;
    }

}