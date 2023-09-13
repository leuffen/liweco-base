import {customElement, ka_create_element, ka_dom_ready, ka_sleep} from "@kasimirjs/embed";
import {LeuOpenHours} from "../types/leu-openhours";
import {OfficeHours} from "../business/office-hours";
import {markdownToHtml} from "../helper/functions";

const defaultModalTemplate = `
<div class="modal-backdrop fade"></div>
<div class="leu-vacation-modal modal fade d-block" tabindex="-1" data-leu-dismiss="modal" >

    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable %%classes%%" role="dialog">
        <div class="modal-content">
            <div class="modal-header position-relative">
                <h5 class="modal-title">%%title%%</h5>
                <button type="button" class="btn-close position-absolute top-0 end-0 p-4" style="top: 0" data-leu-dismiss="modal" aria-label="Schließen"></button>
            </div>
            <div class="modal-body">
                %%body%%
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-leu-dismiss="modal">Schließen</button>
            </div>
        </div>
    </div>
</div>
`

class OpenHoursInterface {
    public _editor: string
    public table: [
        {day: string, time: string }
    ]
    public _status_values: string[]
    json: [
        {dayOfWeek: string|number, from: string, to: string, status: string}
    ]
    public vacation: [
        {from: string, till: string, short_text: string, text : string, title : string}
    ]
}


@customElement("liweco-vacation-modal")
export class LiwecoVacationModal extends HTMLElement {


    public origOverflow = "";
    public showElement : HTMLDivElement;

    constructor() {
        super();
    }

    public async show(meta : any) {

        this.origOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        let content = defaultModalTemplate;
        content = content.replace("%%title%%", markdownToHtml(meta.title))
            .replace("%%body%%", markdownToHtml(meta.text.replace(/\n/g, "<br>")))
            .replace("%%classes%%", meta.classes ?? "");
        this.showElement.innerHTML = content;
        await ka_sleep(10);
        this.showElement.querySelectorAll(".fade").forEach((e)=>e.classList.add("show"));
    }

    public async hide() {

        if (this.showElement.innerHTML === "")
            return;

        document.body.style.overflow = this.origOverflow;

        this.showElement.querySelectorAll(".fade").forEach((e)=>e.classList.remove("show"));
        await ka_sleep(200);

        this.showElement.innerHTML = "";
    }


    async connectedCallback() {
        this.style.display = "none";
        await ka_dom_ready();
        await ka_sleep(100);

        if (typeof window["openhours"] === "undefined") {
            console.error("[liweco-vacation-modal] window.openhours not defined");
            return;
        }
        let openhoursData : LeuOpenHours = window["openhours"];

        if (! Array.isArray(openhoursData.vacation)) {
            console.error("[liweco-vacation-modal] window.openhours.vacation is not a array");
            return;
        }
        let openhours = new OfficeHours();
        openhours.loadStruct(openhoursData);


        this.showElement = ka_create_element("div", {"owner": "leu-vacation-modal"}) as HTMLDivElement;
        document.body.append(this.showElement);

        this.showElement.addEventListener("click", (e : Event) => {
            let target = e.target as HTMLElement;
            if (target.hasAttribute("data-leu-dismiss")) {
                // Push History (don't use history.back() - it will fail if the page was opend with anchor)
                this.hide();
            }
        })


        if (openhours.isVacation(null)) {
            this.show(openhours.getVacation(null));
        }

    }

    async disconnectedCallback() {

        this.showElement.remove();
    }

}
