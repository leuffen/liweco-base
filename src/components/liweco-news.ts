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

        let dataClass = this.getAttribute("data-class");

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

        let newsDiv = ka_create_element("div", {"data-owner": "liweco-news", class: dataClass}, "", this);
        let msgCount = 0;
        for (let curVac of openhours.getUpcomingVacation(null)) {
            msgCount++;
            ka_create_element("p", {"data-owner": "liweco-vacaction"}, curVac.title, newsDiv);
        }

        if (msgCount === 0) {
            this.classList.add("no-news");
            this.innerHTML = this.default;
        }

    }

    disconnectedCallback() {
    }

}
