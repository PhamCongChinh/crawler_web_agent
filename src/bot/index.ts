

export class Bot {
    private gpm: any;
    private _browser: any;

    constructor(gpm: any) {
        this.gpm = gpm
        this._browser = null
    }

    get browser() {
        return this._browser;
    }

    set browser(value: any) {
        this._browser = value;
    }

    async setup(profile_id: string) {
        try {
            const { data, message } = await this.gpm
        } catch (error: any) {
            console.log(error.message);
        }
    }
}