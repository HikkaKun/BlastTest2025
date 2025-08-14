const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomComponent extends cc.Component {
    protected onEnable(): void {
        this._toggleEvents('on');
    }

    protected onDisable(): void {
        this._toggleEvents('off');
    }

    protected _toggleEvents(func: 'on' | 'off') {
        
    }
}
