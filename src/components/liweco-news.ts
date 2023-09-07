import {customElement, ka_create_element, ka_dom_ready, ka_sleep} from "@kasimirjs/embed";
import {LeuOpenHours} from "../types/leu-openhours";
import {OfficeHours} from "../business/office-hours";



@customElement("liweco-news")
export class LiwecoVacationModal extends HTMLElement {



    constructor() {
        super();
    }



    private default : string = null;


    async connectedCallback() {
        await ka_dom_ready();
        await ka_sleep(100);

        if (typeof window["openhours"] === "undefined") {
            console.error("[liweco-news] window.openhours not defined");
            return;
        }
        let openhoursData : LeuOpenHours = window["openhours"];


        let openhours = new OfficeHours();
        openhours.loadStruct(openhoursData);


        if (this.default === null)
            this.default = this.innerHTML;

        this.innerHTML = "";

        for (let curVac of openhours.getUpcomingVacation(null)) {
            ka_create_element("div", {"owner": "liweco-vacaction"}, [
                ka_create_element("span", {"class": "liweco-vacation__date"}, curVac.fromDate.toLocaleDateString() + " - " + curVac.tillDate.toLocaleDateString() + ": "),
                ka_create_element("span", {"class": "liweco-vacation__title", "title": curVac.text}, curVac.title),
            ], this);
        }

        if (this.innerHTML.trim() === "") {
            this.innerHTML = this.default;
        }

    }

    disconnectedCallback() {
    }

}
