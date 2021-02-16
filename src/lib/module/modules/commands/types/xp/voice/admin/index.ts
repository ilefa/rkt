import MultiCommand from '../../../../components/multi';

import ResetClientCommand from './reset';
import ResetGuildCommand from './resetAll';

import { Permissions } from 'discord.js';
import { CommandCategory } from '../../../../command';
import { VoiceBoardManager } from '../../../../../vcboard';

export default class VoiceAdminCommand extends MultiCommand<VoiceBoardManager> {

    boardManager: VoiceBoardManager;

    constructor(boardManager: VoiceBoardManager) {
        super('vcadmin', Permissions.FLAGS.ADMINISTRATOR, CommandCategory.XP, boardManager);
    }

    registerComponents() {
        this.register(new ResetClientCommand());
        this.register(new ResetGuildCommand());
    }

}