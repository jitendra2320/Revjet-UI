export default class DefaultSettings {

    static loader = null;
    static alert = null;


    static setLoader(item) {
        this.loader = item
    }

    static getLoader() {
        return this.loader;
    }

    static setAlert(item) {
        this.alert = item
    }

    static getAlert() {
        return this.alert;
    }

    static showAlert(message, variant) {
        if (this.alert !== null) {
            this.alert.show(message, variant);
        }
    }

}