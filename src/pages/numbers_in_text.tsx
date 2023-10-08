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
    return <div>
        <h1>Numbers In Text</h1>
        <textarea rows={8} cols={80} onChange={handleTextChange} />
        <table>
            <tr><th>Numbers</th><td>{number_strings.join(" ")}</td></tr>
            <tr><th>Sum</th><td>{sum}</td></tr>
            <tr><th>Avg</th><td>{avg}</td></tr>
        </table>
    </div>
}

mount_app(<App></App>)
