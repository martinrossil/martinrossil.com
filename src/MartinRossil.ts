import { UnamiDev } from 'unami';

export default class MartinRossil extends UnamiDev {
    public constructor() {
        super();
        console.log('MartinRossil constructor()');
    }
}
customElements.define('martin-rossil', MartinRossil);
