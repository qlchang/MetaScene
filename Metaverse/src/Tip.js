export default class Tip {
    constructor(message) {
        let msgDiv = document.createElement("div")
        msgDiv.className = "tip"
        msgDiv.innerHTML = message
        document.querySelector("#root").appendChild(msgDiv)

        setTimeout(() => {
            msgDiv.style.opacity = 0
        }, 4000)

        setTimeout(() => {
            document.querySelector("#root").removeChild(msgDiv)
        }, 5000)
    }
}