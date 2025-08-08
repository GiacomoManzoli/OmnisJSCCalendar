import { Calendar, formatDateYMD } from "./Calendar"
import { OmnisEvents } from "./OmnisEvents"
/****** CONSTANTS ******/
var PROPERTIES = {
    // <OmnisUpdateMarker_PropertyConstants_Begin>
    selecteddate: "$selecteddate",
    statesDef: "$statesdef",
    hilitetoday: "$hilitetoday",
    hiliteselected: "$hiliteselected",
    // <OmnisUpdateMarker_PropertyConstants_End>
}

var EVENTS = {
    evNetOmnisControlOpened: 1,
    evDateChanged: 2,
    evMonthChanged: 3,
    evDayHeaderClick: 4,
}

export class ctrl_com_888sp_calendar extends ctrl_base {
    private events: OmnisEvents
    calendar: Calendar

    autoUpdate: boolean = false

    private renderOnPropsUpdate: boolean = true

    constructor() {
        super()
        this.init_class_inst() // initialize our class
        this.events = new OmnisEvents(this, EVENTS)
    }

    init_ctrl_inst(form, elem, rowCtrl, rowNumber) {
        super.init_ctrl_inst(form, elem, rowCtrl, rowNumber)

        var client_elem = this.getClientElem()
        var datapropsobj = JSON.parse(client_elem.getAttribute("data-props"))

        this.initCalendar(client_elem)

        this.renderOnPropsUpdate = false
        for (let propName in PROPERTIES) {
            const propValue = datapropsobj[propName] // L'oggetto è indicizzato per il nome senza $
            this.setProperty(PROPERTIES[propName], propValue)
        }
        this.renderOnPropsUpdate = true

        this.update()
        return false
    }

    updateCtrl(what, row, col, mustUpdate) {
        var elem = this.getClientElem()
        // read $dataname value and display in control
        // const dataname = this.getData()
        // const datanameList = new omnis_list(dataname)

        // this.mData = dataname
        this.calendar.render()
        // if (dataname) {
        //     this.picker.setModules(modules)
        //     this.picker.render()
        // } else {
        //     elem.innerHTML = "CALENDAR"
        // }
    }

    /**
     * This is called when an event registered using this.mEventFunction() is triggered.
     *
     * @param event The event object
     */
    handleEvent(event: any) {
        if (!this.isEnabled()) return true // If the control is disabled, don't process the event.

        switch (event.type) {
            case "click":
                return true
            // case "touchstart":
            //     this.lastTouch = new Date().getTime() // Note the time of the touch start.
            //     this.touchStartPos = {
            //         x: event.changedTouches0.clientX,
            //         y: event.changedTouches0.clientY,
            //     } // Note the starting position of the touch.
            //     break
            // case "touchend":
            //     var time = new Date().getTime()
            //     if (time - this.lastTouch < 500) {
            //         //Treat as a click if less than 500ms have elapsed since touchstart
            //         if (touchWithinRange(this.touchStartPos, event.changedTouches0, 20)) {
            //             //Only treat as a click if less than 20 pixels have been scrolled.
            //             return this.handleClick(event.changedTouches0.offsetX, event.changedTouches0.offsetY)
            //         }
            //     }
            //     break
        }

        super.handleEvent(event)
    }

    getCanAssign(propNumber: number | string) {
        return Object.values(PROPERTIES).includes(propNumber.toString()) || super.getCanAssign(propNumber)
    }

    setProperty(propNumber: number | string, propValue: any) {
        if (!this.getCanAssign(propNumber)) {
            return false
        }
        if (propNumber) {
            switch (propNumber) {
                case PROPERTIES.selecteddate:
                    return false
                case PROPERTIES.statesDef:
                    //     console.log("States set to:", propValue)
                    if (propValue) {
                        try {
                            const states = JSON.parse(propValue)
                            this.calendar.setStates(states)
                        } catch (error) {
                            console.error("Error setting states:", error)
                        }
                    } else {
                        this.calendar.setStates([])
                    }
                    return true
                case PROPERTIES.hilitetoday:
                    this.calendar.setHiliteToday(propValue === "1" || propValue === true)
                    return true
                case PROPERTIES.hiliteselected:
                    this.calendar.setHiliteSelected(propValue === "1" || propValue === true)
                    return true
            }
        }

        return super.setProperty(propNumber, propValue)
    }

    getProperty(propNumber: string | number) {
        switch (propNumber) {
            case PROPERTIES.selecteddate:
                return "this.picker.filter"
            case PROPERTIES.statesDef:
                return "this.picker.backgroundColor"
        }
        return super.getProperty(propNumber)
    }

    private callRenderPropsUpdate() {
        // Aggiunto per evitare di fare dei re-render inutili
        if (this.renderOnPropsUpdate) this.calendar.render()
    }

    private initCalendar(client_elem) {
        this.calendar = new Calendar(client_elem, {
            //
            onDayClick: (date, state) => {
                let dateKey = formatDateYMD(date)
                this.events.triggerEvent(EVENTS.evDateChanged, {
                    pNewDate: dateKey,
                    pState: state,
                })
            },
            //
            onHeaderClick: (dayIndex) => {
                this.events.triggerEvent(EVENTS.evDayHeaderClick, {
                    pDay: dayIndex,
                })
            },
            //
            onMonthChange: (newDate) => {
                const month = newDate.getMonth() + 1
                const year = newDate.getFullYear()
                this.events.triggerEvent(EVENTS.evMonthChanged, {
                    pMonth: month,
                    pYear: year
                })
            },
        })
    }

    /**
     * Client Method $setcurrentdate
     * @param dateYMD - Data nel formato YYYY-MM-DD
     * @returns {character}
     */
    public $setcurrentdate(dateYMD: string): boolean {
        const d = new Date(dateYMD)
        this.calendar.setCurrentDate(d)
        return true
    }

    /**
     * Client Method $setstate
     * @param dateYMD - Data nel formato YYYY-MM-DD
     *
     * @returns {boolean}
     */
    public $setstate(dateYMD, state): boolean {
        const d = new Date(dateYMD)
        this.calendar.setDateState(d, state)
        return true
    }

    /**
     * Client Method $setstatelist
     * @returns {character}
     */
    public $setstatelist(DateList) {
        console.log("Setting state list:", DateList)
        const datanameList = new omnis_list(DateList)

        let stateList = []
        for (let i = 1; i <= datanameList.getRowCount(); i++) {
            const date = datanameList.getData("date", i)
            const state = datanameList.getData("state", i)
            stateList.push({ date: new Date(date), state: state })
        }
        this.calendar.setDateStates(stateList)
    }

    // /**
    //  * Assigns the specified property's value to the control.
    //  * @param propNumber    The Omnis property number
    //  * @param propValue     The new value for the property
    //  * @returns {boolean}   success
    //  */
    // handleClick(pX, pY) {
    //     // send event to Omnis
    //     if (this.canSendEvent(eBaseEvent.evClick)) {
    //         this.eventParamsAdd("pXPos", pX)
    //         this.eventParamsAdd("pYPos", pY)

    //         this.sendEvent(eBaseEvent.evClick)
    //     }
    // }

    // /**
    //  * Called when the size of the control has changed.
    //  */
    // sizeChanged() {
    //     super.sizeChanged()

    //     // // center any text vertically
    //     // var elem = this.getClientElem()
    //     // elem.style.lineHeight = elem.style.height
    // }
}
