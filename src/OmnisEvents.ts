type OmnisEvent = {
    name: string
    id: number
}

/**
 * Classe di utilità per gestire gli eventi di Omnis
 * @class OmnisEvents
 */
export class OmnisEvents {
    private events: Map<number, OmnisEvent>
    private control: ctrl_base

    /**
     *
     * @param control Componente che deve inivare gli eventi ad Omnis
     * @param events Oggetto EVENTS come quello presente nel template generato da Omnis
     */
    constructor(control: ctrl_base, events: { [key: string]: number }) {
        this.control = control
        this.events = new Map<number, OmnisEvent>()

        Object.keys(events).forEach((key) => {
            const eventId = events[key]
            this.events.set(eventId, { name: key, id: eventId })
        })
    }

    /**
     * Invia ad Omnis l'evento specificato.
     * Nell'inviarlo, verifica la definzione dell'evento e se questo è abilitato.
     * @param eventId ID dell'evento
     * @param params Parametri opzionali da inviare con l'evento (devono iniziare con "p")
     * @returns true se l'evento è stato inviato, false altrimenti
     */
    public triggerEvent(eventId: number, params = {}): boolean {
        const event = this.events.get(eventId)
        if (!event) {
            return false
        }

        if (!this.control.canSendEvent(event.id)) {
            return false
        }

        for (const [key, value] of Object.entries(params)) {
            this.control.eventParamsAdd(key, value)
        }
        this.control.sendEvent(event.name)
        return true
    }
}
