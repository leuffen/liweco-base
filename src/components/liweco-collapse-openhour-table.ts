import {customElement, ka_sleep} from "@kasimirjs/embed";

@customElement('liweco-collapse-openhour-table')
class LiwecoCollapseOpenhourTable extends HTMLElement {


    private origContent = null;

    async connectedCallback() {
        console.log("connected");
        await ka_sleep(1);
        if (this.origContent === null) {
            this.origContent = this.innerHTML;
        }
        this.innerHTML = this.origContent;

        let dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
        let dayName = dayNames[(new Date()).getDay()];
        let table = this.querySelector("table");
        if ( ! table.textContent.match(new RegExp( dayName , "im")))
            return;
        table.classList.add("mb-0");
        for (let el of Array.from(table.querySelectorAll("tr"))) {
            if (el.textContent.match(new RegExp( dayName , "im"))) {
                el.firstElementChild.textContent = dayName + " (heute)";
                //el.classList.add("text-primary");
            } else {
                el.classList.add("collapse");
                el.classList.add("text-muted");
            }
        }

        let footer = document.createElement("tfoot");
        table.appendChild(footer)

        footer.innerHTML = '<tr><td colspan="100"><button class="btn btn-sm w-100"><i class="bi bi-caret-down"></i> ganze Woche anzeigen</button></td></tr>'
        footer.firstElementChild.addEventListener("click", () => {
            footer.remove();
            table.querySelectorAll(".collapse").forEach((e) => e.classList.remove("collapse"));
        })


    }
}
