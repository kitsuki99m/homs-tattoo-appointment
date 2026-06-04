// schedule JS for initDatePicker homs-tattoo

class Schedule {
    constructor() {
        this.apiBooking = fetch('http://localhost:3000/api/booking')
        this.apiBookedSlots = fetch('http://localhost:3000/api/booking/slots')
       
    }
}