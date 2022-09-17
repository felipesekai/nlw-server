export function convertHoursStringToMinutes(hourString: string) {
    const [hours, minutes] = hourString.split(':').map(Number);

    const minutesAmmount = (hours * 60) + minutes;
    return minutesAmmount;
}