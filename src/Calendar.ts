import "./style.css"
// src/calendar.ts
export type DayState = string

export interface State {
    name: string
    color: string
    tooltip?: string
}

export interface DayStates {
    [date: string]: DayState
}

export interface CalendarCallbacks {
    onDayClick?: (date: Date, state: DayState | undefined) => void
    onHeaderClick?: (dayIndex: number) => void
    onMonthChange?: (newDate: Date) => void
}

export interface StateColors {
    [state: string]: string
}

export function formatDateYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Mese da 1 a 12
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const months = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
]
const daysOfWeek = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]

function isSameDate(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    )
}

export class Calendar {
    private container: HTMLElement
    private callbacks: CalendarCallbacks
    private statesMap: Map<string, State>
    private selectedDate: Date
    private dayStates: DayStates

    private monthLabel!: HTMLElement
    private calendarGrid!: HTMLElement

    private hiliteToday: boolean = true
    private hiliteSelected: boolean = true

    constructor(containerElement: HTMLElement, callbacks: CalendarCallbacks = {}, states: State[] = []) {
        this.container = containerElement
        this.callbacks = callbacks
        this.selectedDate = new Date()
        this.dayStates = {}

        this.statesMap = new Map()
        states.forEach((state) => {
            this.statesMap.set(state.name, state)
        })
        this.render()
    }

    /**
     * Imposta gli stati possibili per i giorni del calendario
     * @param states Array di stati per i giorni del calendario
     */
    setStates(states: State[]) {
        this.statesMap = new Map()
        states.forEach((state) => {
            this.statesMap.set(state.name, state)
        })
        this.renderCalendar(this.selectedDate)
    }

    /**
     * Imposta lo stato per la data specificata
     * @param d Data da impostare lo stato
     * @param state Stato da impostare per la data, se non specificato rimuove lo stato attuale
     */
    setDateState(d: Date, state: string = "") {
        const dateKey = formatDateYMD(d) 
        if (state && this.statesMap.has(state)) {
            this.dayStates[dateKey] = state
        } else {
            delete this.dayStates[dateKey]
        }
        this.renderCalendar(this.selectedDate)
    }

    /**
     * Imposta gli stati per le date specificate.
     * Attenzione: questa funzione sovrascrive gli stati esistenti.
     * @param dateStates Array di oggetti con data e stato da impostare
     */
    setDateStates(dateStates: {date: Date, state:string}[]) {
        console.debug("Setting date states:", dateStates)
        this.dayStates = {}
        dateStates.forEach(({date, state}) => {
            const dateKey = formatDateYMD(date) 
            if (state && this.statesMap.has(state)) {
                this.dayStates[dateKey] = state
            } else {
                delete this.dayStates[dateKey]
            }

        })
        console.debug("Day states after setting:", this.dayStates)
        this.renderCalendar(this.selectedDate)
    }

    setHiliteToday(hilite: boolean) {
        this.hiliteToday = hilite
        this.renderCalendar(this.selectedDate)
    }

    setHiliteSelected(hilite: boolean) {
        this.hiliteSelected = hilite
        this.renderCalendar(this.selectedDate)
    }

    /**
     * Renderizza il calendario
     */
    public render() {
        this.renderBase()
        this.renderCalendar(this.selectedDate)
    }

    /**
     * Imposta la data corrente del calendario e aggiorna la visualizzazione
     * @param d Data da impostare come data corrente del calendario
     */
    public setCurrentDate(d: Date) {
        const oldMonth = this.selectedDate.getMonth()
        const oldYear = this.selectedDate.getFullYear()

        this.selectedDate = d
        this.renderCalendar(this.selectedDate)

        console.debug("Current date set to:", this.selectedDate)

        if (d.getMonth() !== oldMonth || d.getFullYear() !== oldYear) {
            this.triggerOnMonthChanged(d)
        }
    }

    /**
     * Renderizza la struttura base del calendario
     */
    private renderBase() {
        this.container.innerHTML = `
        <div class="calendar">
            <div class="calendar-header">
            <button id="prevMonth">&lt;</button>
            <div id="monthLabel"></div>
            <button id="nextMonth">&gt;</button>
            </div>
            <div class="calendar-grid" id="calendarGrid"></div>
        </div>
        `

        this.monthLabel = this.container.querySelector("#monthLabel")!
        this.calendarGrid = this.container.querySelector("#calendarGrid")!

        this.container.querySelector("#prevMonth")?.addEventListener("click", () => {
            this.selectedDate.setMonth(this.selectedDate.getMonth() - 1)
            if (this.callbacks.onMonthChange) {
                this.callbacks.onMonthChange(this.selectedDate)
            }
            this.renderCalendar(this.selectedDate)
        })

        this.container.querySelector("#nextMonth")?.addEventListener("click", () => {
            this.selectedDate.setMonth(this.selectedDate.getMonth() + 1)
            if (this.callbacks.onMonthChange) {
                this.callbacks.onMonthChange(this.selectedDate)
            }
            this.renderCalendar(this.selectedDate)
        })
    }

    /**
     * Renderizza il calendario per la data specificata
     * @param date Data corrente da visualizzare nel calendario
     */
    private renderCalendar(date: Date) {
        console.debug("Rendering calendar for date:", date)
        this.calendarGrid.innerHTML = ""

        const year = date.getFullYear()
        const month = date.getMonth()
        this.monthLabel.textContent = `${months[month]} ${year}`

        daysOfWeek.forEach((day, idx) => {
            const el = document.createElement("div")
            el.className = "calendar-day header"
            el.textContent = day
            el.addEventListener("click", () => this.handleHeaderClick(idx))
            this.calendarGrid.appendChild(el)
        })

        const firstDay = new Date(year, month, 1)
        const startDay = (firstDay.getDay() + 6) % 7
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const daysInPrevMonth = new Date(year, month, 0).getDate()
        const totalCells = 42

        for (let i = 0; i < totalCells; i++) {
            const el = document.createElement("div")
            el.className = "calendar-day"

            let dayNumber: number,
                isOutside = false,
                cellDate: Date

            if (i < startDay) {
                dayNumber = daysInPrevMonth - startDay + i + 1
                cellDate = new Date(year, month - 1, dayNumber)
                isOutside = true
            } else if (i >= startDay + daysInMonth) {
                dayNumber = i - startDay - daysInMonth + 1
                cellDate = new Date(year, month + 1, dayNumber)
                isOutside = true
            } else {
                dayNumber = i - startDay + 1
                cellDate = new Date(year, month, dayNumber)
            }

            el.textContent = dayNumber.toString()

            if (isOutside) {
                el.classList.add("outside")
            }

            const today = new Date()
            if (this.hiliteToday && isSameDate(cellDate, today)) {
                el.classList.add("today")
            }

            const dateKey = formatDateYMD(cellDate)
            const state = this.dayStates[dateKey]
            if (state && this.statesMap.has(state)) {
                this.renderStateDot(el, state)
            }

            if (this.hiliteSelected && isSameDate(cellDate, this.selectedDate)) {
                el.classList.add("selected-day")
            }

            el.addEventListener("click", () => {
                this.handleDayClick(cellDate, state)
            })

            this.calendarGrid.appendChild(el)
        }
    }

    private renderStateDot(el: HTMLElement, state: string | undefined) {
        const stateDef = this.statesMap.get(state)!
        const dot = document.createElement("div")
        dot.className = "day-state-dot"
        dot.style.backgroundColor = stateDef.color
        el.appendChild(dot)
    }

    private handleHeaderClick(dayIndex: number) {
        // Converte l'indice del giorno secondo la gestione di Omnis
        // 0=kGanttSunday, 1=kGanttMonday, ..., 6=kGanttSaturday
        const dow = (dayIndex + 1) % 7
        this.triggerOnHeaderClicked(dow)
    }

    private handleDayClick(date: Date, state: DayState | undefined) {
        const oldMonth = this.selectedDate.getMonth()
        const oldYear = this.selectedDate.getFullYear()

        this.selectedDate = new Date(date)

        this.renderCalendar(this.selectedDate)

        if (date.getMonth() !== oldMonth || date.getFullYear() !== oldYear) {
            this.triggerOnMonthChanged(this.selectedDate)
        }

        this.triggerOnDayClicked(date, state)
    }

    /**
     * Invoca la callback per notificare il click sull'intestazione del giorno della settimana
     * @param dow Indice del giorno della settimana (0=Dom, 1=Lun, ..., 6=Sab)
     */
    private triggerOnHeaderClicked(dow: number) {
        if (this.callbacks.onHeaderClick) {
            this.callbacks.onHeaderClick(dow)
        }
    }
    /**
     * Invoca la callback per notificare il cambiamento del mese
     * @param date Data che ha attivato il cambiamento del mese
     */
    private triggerOnMonthChanged(date: Date) {
        if (this.callbacks.onMonthChange) {
            this.callbacks.onMonthChange(date)
        }
    }

    /**
     * Invoca la callback per notificare il click su un giorno
     * @param date Data del giorno cliccato
     * @param state Stato del giorno cliccato, se definito
     */
    private triggerOnDayClicked(date: Date, state: DayState | undefined) {
        if (this.callbacks.onDayClick) {
            this.callbacks.onDayClick(date, state)
        }
    }
}
