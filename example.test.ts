import { describe, it, expect } from "bun:test";
import initialize from "./index"
const { scenario, given, when, then, and } = initialize({ describe, it })

class TimeTravelMachine {
  #currentYear: number;
  #lastCommunicate: string | null;

  // todo: use object as constructor input for named params
  constructor(currentYear: number) {
    this.#currentYear = currentYear;
    this.#lastCommunicate = null;
  }

  whatYearAreWeIn() {
    return this.#currentYear
  }

  retrieveLastCommunicate() {
      return this.#lastCommunicate
  } 

  pressTravelForwardInTimeButton(pointInTime: { year: number }) {
    if(pointInTime.year < this.#currentYear) {
      this.#lastCommunicate = "You are an idiot. Can't 'travel forward' to a past date."
      return
    }
    
    this.#currentYear = pointInTime.year
  }

  // todo: Travel Back > Travel Backward
  pressTravelBackwardInTimeButton(pointInTime: { year: number }) {
    if(pointInTime.year > this.#currentYear ) {
        this.#lastCommunicate = "You are an idiot. Can't 'travel backward' to a future date."
        return
    }

    this.#currentYear = pointInTime.year
  }    
}

scenario `set current location in time for the machine`
  (
    given `a chosen year - 2026`
    (
      _ => 2026
    ),

    when `time travel machine is initialized that year`
    (
      test => new TimeTravelMachine(test.input)
    ),

    then `time travel machine is located in the year provided`
    (
      test => expect(test.result.whatYearAreWeIn()).toEqual(test.input)
    ) 
  )

scenario `<travel forward> button`
  (
    given `a time machine set in year 2026`
    (
      _ => new TimeTravelMachine(2026)
    ),

    when `<travel forward> button pressed with configured year 2027`
    (
      test => test.input.pressTravelForwardInTimeButton({ year: 2027 })
    ),

    then `time machine is located in year 2027`
    (
      test => expect(test.input.whatYearAreWeIn()).toEqual(2027)
    ) 
  )

scenario `<travel backward> button`
  (
    given `a time machine set in year 2026`
    (
      _ => new TimeTravelMachine(2026)
    ),

    when `<travel backward> button pressed with configured year 2025`
    (
      test => test.input.pressTravelBackwardInTimeButton({ year: 2025 })
    ),

    then `time machine is located in year 2025`
    (
      test => expect(test.input.whatYearAreWeIn()).toEqual(2025)
    ) 
  )

scenario `misuse of <travel backward> button by providing future date`
  (
    given `a time machine set in year 2026`
    (
      _ => new TimeTravelMachine(2026)
    ),

    when `<travel backward> button pressed with year in the future`
    (
      test => test.input.pressTravelBackwardInTimeButton({ year: 2026 + 1 })
    ),

    then `time machine calls you an idiot`
    (
      test => expect(test.input.retrieveLastCommunicate()).toEqual("You are an idiot. Can't 'travel backward' to a future date.")
    ),

    and `you are still located in the same year`
    (
       test => expect(test.input.whatYearAreWeIn()).toEqual(2026)
    )
  )

scenario `misuse of <travel forward> button by providing past date`
  (
    given `a time machine set in year 2026`
    (
      _ => new TimeTravelMachine(2026)
    ),

    when `<travel backward> button pressed with year in the past`
    (
      test => {
        test.input.pressTravelForwardInTimeButton({ year: 2026 - 1 })
        return test.input
      }
    ),

    then `time machine calls you an idiot`
    (
      test => expect(test.result.retrieveLastCommunicate()).toEqual("You are an idiot. Can't 'travel forward' to a past date.")
    ),

    and `you are still located in the same year`
    (
       test => expect(test.input.whatYearAreWeIn()).toEqual(2026)
    )
  )
  
 
scenario `no communicate after time machine initialization`
  (
    given `a time machine`
    (
      _ => new TimeTravelMachine(2026)
    ),

    
    when `no actions are performed`
    (
      test => test.input
    ),

    then `time machine should contain no communicate`
    (
      test => expect(test.result.retrieveLastCommunicate()).toEqual(null)
    ),
  )  

