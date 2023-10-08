import { mount_app } from "../common";

let tools = [
    {
        "title": "Numbers In Text",
        "url": "numbers_in_text.html"
    },
    {
        "title": "Timestamp",
        "url": "timestamp.html"
    },
]

function List() {
    let items = tools.map((tool) => <a href={tool.url}>{tool.title}</a>)
    return <>
        <h1>Tools</h1>
        <div className="articles_list">{items}</div>
    </>
}

mount_app(<List></List>)
