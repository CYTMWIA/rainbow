import { useState } from "react";
import { mount_app } from "../common";
import { Rainbow } from "../components/rainbow";

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

mount_app(<Rainbow><Display></Display></Rainbow>)
