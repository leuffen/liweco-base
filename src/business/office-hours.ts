import {LeuOpenHours} from "../types/leu-openhours";

type OpenHour = {
    from: string;
    till: string;
};

type Vacation = {
    fromDate: Date;
    tillDate: Date;
    title: string;
    text: string;
};

type TimeInterval = {
    days?: number;
    months?: number;
};

const DAY_OF_WEEK: string[] = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export class OfficeHours {
    private openHours: Map<string, OpenHour[]> = new Map();
    private vacations: Vacation[] = [];





    private static convertToDateTime(input: Date | string | null): Date | null {
        if (input === null || input === undefined) {
            return null;
        }
        if (input instanceof Date) {
            return input;
        } else if (typeof input === 'string') {
            return new Date(input);
        } else {
            return new Date();
        }
    }

    addOpenHour(dayOfWeek: string, from: string, till: string): void {
        const dayHours = this.openHours.get(dayOfWeek) || [];
        dayHours.push({ from, till });
        this.openHours.set(dayOfWeek, dayHours);
    }

    addVacation(fromDate: Date | string, tillDate: Date | string, title: string, text: string): void {
        let tillDateEod = OfficeHours.convertToDateTime(tillDate);
        if (tillDateEod instanceof Date) {
            tillDateEod.setHours(23, 59, 59, 999); // Set to end of day
        }
        this.vacations.push({
            fromDate: OfficeHours.convertToDateTime(fromDate),
            tillDate: tillDateEod, // Set to end of day
            title,
            text
        });
    }

    isVacation(date: Date | string | null = null): boolean {
        const dateTime = OfficeHours.convertToDateTime(date);
        return this.vacations.some(vacation =>
            vacation.fromDate !== null && dateTime >= vacation.fromDate && dateTime <= vacation.tillDate);
    }

    getVacation(date: Date | string | null = null): { title: string, text: string } | null {
        const dateTime = OfficeHours.convertToDateTime(date);
        const vacation = this.vacations.find(vac =>
            dateTime >= vac.fromDate && dateTime <= vac.tillDate);
        return vacation ? { title: vacation.title, text: vacation.text } : null;
    }

    getUpcomingVacation(interval: TimeInterval | null = null): Vacation[] {
        const currentDate = new Date();
        const endDate = new Date(currentDate);

        if (interval === null) {
            return this.vacations.filter(vacation => vacation.tillDate >= currentDate);
        }
        if (interval.days) {
            endDate.setDate(endDate.getDate() + interval.days);
        }

        if (interval.months) {
            endDate.setMonth(endDate.getMonth() + interval.months);
        }

        return this.vacations.filter(vacation =>
            (vacation.fromDate >= currentDate && vacation.fromDate <= endDate) ||
            (vacation.tillDate >= currentDate && vacation.tillDate <= endDate) ||
            (vacation.fromDate <= currentDate && vacation.tillDate >= endDate)
        );

    }

    isOpen(dateTime: Date | string | null = null): boolean {
        const dateObj = OfficeHours.convertToDateTime(dateTime);
        return !this.isVacation(dateObj) && this.getTodayOpenDates(dateObj).some(hour => {
            const currentTime = `${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
            return currentTime >= hour.from && currentTime <= hour.till;
        });
    }

    getNextOpenDate(dateTime: Date | string | null = null): Date {
        let nextDate = OfficeHours.convertToDateTime(dateTime);
        while (this.isVacation(nextDate) || !this.isOpen(nextDate)) {
            nextDate.setHours(0, 0, 0, 0); // Reset time to beginning of day
            nextDate.setDate(nextDate.getDate() + 1); // Go to the next day
        }
        return nextDate;
    }

    getTodayOpenDates(dateTime: Date | string | null = null): OpenHour[] {
        const dateObj = OfficeHours.convertToDateTime(dateTime);
        const dayOfWeek = DAY_OF_WEEK[dateObj.getDay()];
        return this.openHours.get(dayOfWeek) || [];
    }

    getHumanReadableOpenDates(dateTime: Date | string | null = null): string {
        const dateObj = OfficeHours.convertToDateTime(dateTime);
        if (this.isVacation(dateObj)) {
            const vacation = this.getVacation(dateObj);
            return `Closed due to vacation: ${vacation?.title}. Next open date: ${DAY_OF_WEEK[this.getNextOpenDate(dateObj).getDay()]} ${this.getNextOpenDate(dateObj).toLocaleDateString()} at 9:00.`;
        } else if (this.isOpen(dateObj)) {
            const openHours = this.getTodayOpenDates(dateObj);
            const currentOpenHour = openHours.find(hour =>
                `${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}` <= hour.till);
            return `Currently open till ${currentOpenHour?.till}. Next open date: ${DAY_OF_WEEK[this.getNextOpenDate(dateObj).getDay()]} at 9:00.`;
        } else {
            const nextOpenDate = this.getNextOpenDate(dateObj);
            const nextOpenHours = this.getTodayOpenDates(nextOpenDate);
            const nextOpenDay = DAY_OF_WEEK[nextOpenDate.getDay()];
            const nextOpenDateStr = nextOpenHours.map(hour => `${hour.from} - ${hour.till}`).join(' and ');
            return `Closed now. Open next: ${nextOpenDay} ${nextOpenDateStr}.`;
        }
    }


    loadStruct(inputData: LeuOpenHours): void {
        // Clear existing data
        this.openHours.clear();
        this.vacations = [];

        // Load open hours
        inputData.json.forEach(hour => {
            if (hour.status === "open") {  // Assuming you want to only add hours when the status is 'open'
                const day = typeof hour.dayOfWeek === 'number' ? DAY_OF_WEEK[hour.dayOfWeek] : hour.dayOfWeek;
                this.addOpenHour(day, hour.from as string, hour.to as string);
            }
        });

        // Load vacations
        if ( ! Array.isArray(inputData.vacation)) {
            return;
        }
        inputData.vacation.forEach(vac => {
            this.addVacation(vac.from, vac.till, vac.title, vac.text);
        });
    }

}
