export function markdownToHtml(input: string): string {
    // Kursiv & Fett: ***text***
    let html = input.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

    // Fett: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Kursiv: *text*
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Horizontaler Trennstrich: ---
    html = html.replace(/---/g, '<hr>');

    return html;
}
