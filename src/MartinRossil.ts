import { ApplicationElement, ILabelElement, LabelElement, TypeFace, VerticalLayout } from 'unami';

export default class MartinRossil extends ApplicationElement {
    public constructor() {
        super();
        this.layout = new VerticalLayout(0, 'center', 'middle');
        this.theme.typography.primary = new TypeFace('Inter', 0.727, 0.09, 0.0);
        window.addEventListener('load', () => {
            this.addElement(this.labelElement);
        });
    }

    private _labelElement!: ILabelElement;

    private get labelElement(): ILabelElement {
        if (!this._labelElement) {
            this._labelElement = new LabelElement();
            this._labelElement.text = 'Martin Rossil';
            this._labelElement.fontSize = 50;
            this._labelElement.fontWeight = 700;
            this._labelElement.letterSpacing = 10;
            this._labelElement.textColor = this.colors.primary.c500;
            this._labelElement.typeFace = this.theme.typography.primary;
        }
        return this._labelElement;
    }
}
customElements.define('martin-rossil', MartinRossil);
