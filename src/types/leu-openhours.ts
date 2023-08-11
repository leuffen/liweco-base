
export class LeuOpenHours {
    public _editor: string
    public table: [
        {day: string, time: string }
    ]
    json: [
        {dayOfWeek: string|number, from: string|number, to: string|number, status: string}
    ]
    public vacation: [
        {from: string, till: string, short_text?: string, text : string, title : string}
    ]
}
