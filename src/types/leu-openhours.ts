
export class LeuOpenHours {
    public _editor: string
    public table: [
        {day: string, time: string }
    ]
    public _status_values?: string[]
    json: [
        {dayOfWeek: string|number, from: string, to: string, status: string}
    ]
    public vacation: [
        {from: string, till: string, short_text: string, text : string, title : string}
    ]
}
