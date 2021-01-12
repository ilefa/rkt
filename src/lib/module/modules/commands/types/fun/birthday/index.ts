import ListBirthdaysCommand from './list';
import NextBirthdayCommand from './next';
import SetBirthdayCommand from './set';

import BirthdayManager from '../../../../birthday';
import MultiCommand from '../../../components/multi';

import { Permissions } from 'discord.js';

export default class BirthdayCommand extends MultiCommand<BirthdayManager> {
    
    birthdayManager: BirthdayManager;
    
    constructor(birthdayManager: BirthdayManager) {
        super('birthday', Permissions.FLAGS.SEND_MESSAGES, birthdayManager);
        this.birthdayManager = birthdayManager;
    }
    
    registerComponents() {
        this.register(new ListBirthdaysCommand());
        this.register(new NextBirthdayCommand());
        this.register(new SetBirthdayCommand());
    }

}