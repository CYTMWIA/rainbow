// import moment from 'moment';

export function formatTimeFromTimestamp(ts) {
    // return moment.unix(ts).format('YYYY/MM/DD hh:mm:ss')

    // Using `Date` instead of `moment` due to large output code size
    let d = (new Date(ts * 1000))
    let YYYY = d.getFullYear().toString().padStart(4, '0')
    let MM = (d.getMonth() + 1).toString().padStart(2, '0')
    let DD = d.getDate().toString().padStart(2, '0')
    let hh = d.getHours().toString().padStart(2, '0')
    let mm = d.getMinutes().toString().padStart(2, '0')
    let ss = d.getSeconds().toString().padStart(2, '0')
    return `${YYYY}/${MM}/${DD} ${hh}:${mm}:${ss}`
}
