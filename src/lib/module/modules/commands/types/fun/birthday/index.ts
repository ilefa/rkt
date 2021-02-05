import ListBirthdaysCommand from './list';
import NextBirthdayCommand from './next';
import SetBirthdayCommand from './set';
import SetBirthdayChannelCommand from './channel';
import SetBirthdayMessagesCommand from './message';
import SetBirthdayScheduleCommand from './schedule';

import BirthdayManager from '../../../../birthday';
import MultiCommand from '../../../components/multi';

import { Permissions } from 'discord.js';
import { CommandCategory } from '../../../command';

export default class BirthdayCommand extends MultiCommand<BirthdayManager> {
    
    birthdayManager: BirthdayManager;
    
    constructor(birthdayManager: BirthdayManager) {
        super('birthday', CommandCategory.FUN, Permissions.FLAGS.SEND_MESSAGES, birthdayManager);
        this.birthdayManager = birthdayManager;
    }
    
    registerComponents() {
        this.register(new ListBirthdaysCommand());
        this.register(new NextBirthdayCommand());
        this.register(new SetBirthdayCommand());
        this.register(new SetBirthdayChannelCommand());
        this.register(new SetBirthdayMessagesCommand());
        this.register(new SetBirthdayScheduleCommand());
    }

}