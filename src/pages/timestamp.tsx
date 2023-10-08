import { useState } from "react";
import { mount_app } from "../common";

let interval: Timer | undefined = undefined
function Display() {
    const [timestamp, set_timestamp] = useState(0)
    if (!interval) {
        interval = setInterval(() => {
            set_timestamp(Date.now())
        }, 1)
        console.log("Create Timer.")
    }
    return <h1>{timestamp}</h1>
}

mount_app(<Display></Display>)
