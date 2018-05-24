
export default class Menu {

    items:Array<MenuItem>

    constructor() {
        this.items = []
    }

    addItem(item:MenuItem) {
        this.items.push(item)
    }


}

export class MenuItem {
    
    title:string
    url:string
    faIconClass:string
    subItems:Array<MenuItem>

    constructor(title:string, url:string, faIconClass:string) {
        this.title = title
        this.url = url
        this.faIconClass = faIconClass
        this.subItems = []
    }

    addSubItem(item:MenuItem) {
        this.subItems.push(item)
    }

}

