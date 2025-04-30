// https://learn.microsoft.com/en-us/sql/relational-databases/json/how-for-json-escapes-special-characters-and-control-characters-sql-server?view=sql-server-ver16
const replaceMapLs: string[] = [
    "\"",
    "\\",
    "\/",
    "\b",
    "\f",
    "\n",
    "\r",
    "\t",
]

export function specialCharactersStr(str: string): string {
    let result = "";

    for(let s of str.split("")){
        if(replaceMapLs.includes(s)){
            result += ("\\" + s)
        }
        else{
            result += s;
        }
    }

    return result
}
