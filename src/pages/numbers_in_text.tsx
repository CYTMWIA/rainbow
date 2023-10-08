import React, { useState } from "react";
import { mount_app } from "../common";

function App() {
    const [user_input, set_user_input] = useState("")

    // https://stackoverflow.com/questions/12643009/regular-expression-for-floating-point-numbers
    let matches = user_input.matchAll(/[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)/g)
    let numbers: number[] = []
    let number_strings: string[] = []
    for (const match of matches) {
        numbers.push(Number(match[0]))
        number_strings.push(match[0])
    }

    let sum = 0
    numbers.forEach((v) => { sum += v })
    let avg = 0
    if (numbers.length) avg = sum / (numbers.length)

    function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        set_user_input(e.target.value)
    }
    return <div className="numbers-in-text">
        <textarea rows={8} cols={80} onChange={handleTextChange} />
        <div className="numbers-in-text-result">
            <div>Numbers</div><div>{number_strings.join(" ")}</div>
            <div>Count</div><div>{numbers.length}</div>
            <div>Sum</div><div>{sum}</div>
            <div>Avg</div><div>{avg}</div>
        </div>
    </div>
}

mount_app(<App></App>)
